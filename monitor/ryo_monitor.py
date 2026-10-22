"""Local read-only bridge from MSI Afterburner to the Ryo system monitor widget."""

from __future__ import annotations

import ctypes
import errno
import json
import os
import struct
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from ctypes import wintypes
from urllib.parse import parse_qs, urlparse

HOST = "127.0.0.1"
PORT = 8765
ALLOWED_ORIGINS = {
    "https://aksh03010.github.io",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
}
MAX_PATH = 260
BROWSER_NAMES = {"chrome.exe", "msedge.exe", "brave.exe", "firefox.exe", "helium.exe", "vivaldi.exe", "opera.exe"}

kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
FILE_MAP_READ = 0x0004
PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
TH32CS_SNAPPROCESS = 0x00000002
INVALID_HANDLE_VALUE = ctypes.c_void_p(-1).value


class FILETIME(ctypes.Structure):
    _fields_ = [("low", wintypes.DWORD), ("high", wintypes.DWORD)]


class PROCESSENTRY32W(ctypes.Structure):
    _fields_ = [
        ("dwSize", wintypes.DWORD), ("cntUsage", wintypes.DWORD),
        ("th32ProcessID", wintypes.DWORD), ("th32DefaultHeapID", ctypes.c_size_t),
        ("th32ModuleID", wintypes.DWORD), ("cntThreads", wintypes.DWORD),
        ("th32ParentProcessID", wintypes.DWORD), ("pcPriClassBase", wintypes.LONG),
        ("dwFlags", wintypes.DWORD), ("szExeFile", wintypes.WCHAR * MAX_PATH),
    ]


kernel32.OpenFileMappingW.restype = wintypes.HANDLE
kernel32.MapViewOfFile.restype = ctypes.c_void_p
kernel32.OpenProcess.restype = wintypes.HANDLE
kernel32.CreateToolhelp32Snapshot.restype = wintypes.HANDLE
kernel32.CloseHandle.restype = wintypes.BOOL
kernel32.UnmapViewOfFile.restype = wintypes.BOOL
kernel32.OpenFileMappingW.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.LPCWSTR]
kernel32.MapViewOfFile.argtypes = [wintypes.HANDLE, wintypes.DWORD, wintypes.DWORD, wintypes.DWORD, ctypes.c_size_t]
kernel32.CloseHandle.argtypes = [wintypes.HANDLE]
kernel32.UnmapViewOfFile.argtypes = [ctypes.c_void_p]
kernel32.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
kernel32.CreateToolhelp32Snapshot.argtypes = [wintypes.DWORD, wintypes.DWORD]
kernel32.Process32FirstW.argtypes = [wintypes.HANDLE, ctypes.POINTER(PROCESSENTRY32W)]
kernel32.Process32NextW.argtypes = [wintypes.HANDLE, ctypes.POINTER(PROCESSENTRY32W)]
kernel32.GetSystemTimes.argtypes = [ctypes.POINTER(FILETIME), ctypes.POINTER(FILETIME), ctypes.POINTER(FILETIME)]
kernel32.GetProcessTimes.argtypes = [wintypes.HANDLE, ctypes.POINTER(FILETIME), ctypes.POINTER(FILETIME), ctypes.POINTER(FILETIME), ctypes.POINTER(FILETIME)]
kernel32.GlobalMemoryStatusEx.restype = wintypes.BOOL


class MEMORYSTATUSEX(ctypes.Structure):
    _fields_ = [
        ("dwLength", wintypes.DWORD),
        ("dwMemoryLoad", wintypes.DWORD),
        ("ullTotalPhys", ctypes.c_ulonglong),
        ("ullAvailPhys", ctypes.c_ulonglong),
        ("ullTotalPageFile", ctypes.c_ulonglong),
        ("ullAvailPageFile", ctypes.c_ulonglong),
        ("ullTotalVirtual", ctypes.c_ulonglong),
        ("ullAvailVirtual", ctypes.c_ulonglong),
        ("ullAvailExtendedVirtual", ctypes.c_ulonglong),
    ]


kernel32.GlobalMemoryStatusEx.argtypes = [ctypes.POINTER(MEMORYSTATUSEX)]

previous_system = None
previous_processes: dict[int, int] = {}
previous_tick = time.monotonic()


def filetime_value(value: FILETIME) -> int:
    return (value.high << 32) | value.low


def system_cpu_usage() -> float | None:
    global previous_system
    idle, kernel, user = FILETIME(), FILETIME(), FILETIME()
    if not kernel32.GetSystemTimes(ctypes.byref(idle), ctypes.byref(kernel), ctypes.byref(user)):
        return None
    current = (filetime_value(idle), filetime_value(kernel), filetime_value(user))
    old = previous_system
    previous_system = current
    if old is None:
        return None
    idle_delta = current[0] - old[0]
    total_delta = (current[1] - old[1]) + (current[2] - old[2])
    return round(max(0, min(100, (1 - idle_delta / max(1, total_delta)) * 100)), 1)


def memory_usage() -> dict | None:
    status = MEMORYSTATUSEX()
    status.dwLength = ctypes.sizeof(status)
    if not kernel32.GlobalMemoryStatusEx(ctypes.byref(status)) or status.ullTotalPhys == 0:
        return None
    used = status.ullTotalPhys - status.ullAvailPhys
    return {
        "name": "RAM",
        "usage": round(used / status.ullTotalPhys * 100, 1),
        "temperature": None,
        "usedBytes": used,
        "totalBytes": status.ullTotalPhys,
    }


def browser_cpu_usage() -> float | None:
    global previous_processes, previous_tick
    snapshot = kernel32.CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0)
    if snapshot == INVALID_HANDLE_VALUE:
        return None
    current: dict[int, int] = {}
    browser_total = 0
    entry = PROCESSENTRY32W()
    entry.dwSize = ctypes.sizeof(entry)
    try:
        ok = kernel32.Process32FirstW(snapshot, ctypes.byref(entry))
        while ok:
            if entry.szExeFile.lower() in BROWSER_NAMES:
                process = kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, False, entry.th32ProcessID)
                if process:
                    creation, exit_time, kernel, user = FILETIME(), FILETIME(), FILETIME(), FILETIME()
                    try:
                        if kernel32.GetProcessTimes(process, ctypes.byref(creation), ctypes.byref(exit_time), ctypes.byref(kernel), ctypes.byref(user)):
                            total = filetime_value(kernel) + filetime_value(user)
                            current[entry.th32ProcessID] = total
                            browser_total += total - previous_processes.get(entry.th32ProcessID, total)
                    finally:
                        kernel32.CloseHandle(process)
            ok = kernel32.Process32NextW(snapshot, ctypes.byref(entry))
    finally:
        kernel32.CloseHandle(snapshot)
    now = time.monotonic()
    elapsed = max(.05, now - previous_tick)
    previous_tick = now
    previous_processes = current
    if not current:
        return 0.0
    cores = max(1, (os_cpu_count() or 1))
    # Windows FILETIME units are 100 ns; normalize across logical cores.
    return round(max(0, min(100, browser_total / 10_000_000 / elapsed / cores * 100)), 1)


def os_cpu_count() -> int | None:
    return os.cpu_count()


def read_afterburner() -> tuple[float | None, list[dict]]:
    mapping = kernel32.OpenFileMappingW(FILE_MAP_READ, False, "MAHMSharedMemory")
    if not mapping:
        return None, []
    view = kernel32.MapViewOfFile(mapping, FILE_MAP_READ, 0, 0, 0)
    if not view:
        kernel32.CloseHandle(mapping)
        return None, []
    try:
        header = ctypes.string_at(view, 32)
        signature, version, header_size, count, entry_size, _, gpu_count, gpu_size = struct.unpack_from("<8I", header)
        # Five MAX_PATH strings and six 32-bit values make a 1,324-byte entry.
        if signature != 0x4D41484D or entry_size < 1324 or count > 2048 or gpu_count > 32:
            return None, []
        gpu_names = {}
        for index in range(gpu_count):
            offset = header_size + count * entry_size + index * gpu_size
            raw = ctypes.string_at(view + offset, min(gpu_size, 5 * MAX_PATH * 2))
            names = [raw[i:i + MAX_PATH].split(b"\0", 1)[0].decode("mbcs", "ignore").strip() for i in range(0, 5 * MAX_PATH, MAX_PATH)]
            if names[2]:
                gpu_names[index] = names[2]

        cpu_temp = None
        gpus: dict[int, dict] = {}
        for index in range(count):
            offset = header_size + index * entry_size
            raw = ctypes.string_at(view + offset, entry_size)
            name = raw[:MAX_PATH].split(b"\0", 1)[0].decode("mbcs", "ignore").lower()
            value = struct.unpack_from("<f", raw, 5 * MAX_PATH)[0]
            gpu_index = struct.unpack_from("<I", raw, 5 * MAX_PATH + 16)[0]
            source_id = struct.unpack_from("<I", raw, 5 * MAX_PATH + 20)[0]
            if not (-50 <= value <= 1000):
                continue
            is_temp = "temp" in name or source_id in (0x00, 0x80)
            is_usage = "usage" in name or "util" in name or "load" in name or source_id == 0x01
            is_cpu = gpu_index >= gpu_count and ("cpu" in name or source_id == 0x80)
            if is_cpu and is_temp:
                cpu_temp = value
            elif not is_cpu and ("gpu" in name or source_id in (0x00, 0x01) or gpu_index < gpu_count):
                gpu = gpus.setdefault(gpu_index, {"name": gpu_names.get(gpu_index, f"GPU {gpu_index + 1}"), "index": gpu_index + 1, "usage": None, "temperature": None})
                if is_temp:
                    gpu["temperature"] = value
                elif is_usage:
                    gpu["usage"] = value
        ordered_gpus = [gpus[index] for index in sorted(gpus)[:2]]
        # GPU 2 can be integrated graphics whose temperature is exposed as a
        # CPU sensor. Apply the fallback by displayed order, not the raw index
        # from Afterburner (which varies between driver versions).
        if len(ordered_gpus) > 1 and cpu_temp is not None:
            ordered_gpus[1]["temperature"] = cpu_temp
        return cpu_temp, ordered_gpus
    except (OSError, ValueError, struct.error):
        return None, []
    finally:
        kernel32.UnmapViewOfFile(view)
        kernel32.CloseHandle(mapping)


class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        if self.headers.get("Origin") not in ALLOWED_ORIGINS:
            self.send_error(403)
            return
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", self.headers["Origin"])
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        if self.headers.get("Access-Control-Request-Private-Network") == "true":
            self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Vary", "Origin")
        self.end_headers()

    def do_GET(self):
        origin = self.headers.get("Origin")
        if origin not in ALLOWED_ORIGINS:
            self.send_error(403)
            return
        query = parse_qs(urlparse(self.path).query)
        mode = query.get("mode", ["computer"])[0]
        cpu_temp, gpus = read_afterburner()
        data = {
            "cpu": {"name": "CPU", "usage": system_cpu_usage(), "temperature": cpu_temp},
            "gpus": gpus,
            "ram": memory_usage(),
            "browser": {"name": "Browser", "usage": browser_cpu_usage(), "temperature": None},
            "updatedAt": int(time.time() * 1000),
        }
        body = json.dumps(data).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Vary", "Origin")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *_args):
        pass


class MonitorServer(HTTPServer):
    # Prevent a second copy from sharing the monitor port on Windows.
    allow_reuse_address = False


if __name__ == "__main__":
    try:
        server = MonitorServer((HOST, PORT), Handler)
    except OSError as error:
        if error.errno == errno.EADDRINUSE or getattr(error, "winerror", None) == 10048:
            print("Another monitor is already using this port. Close its terminal window, then try again.")
            raise SystemExit(1) from None
        raise
    print(f"Ryo Monitor listening on http://{HOST}:{PORT} (Ctrl+C to stop)")
    print("Read-only; only the Ryo website and local development server are allowed.")
    server.serve_forever()
