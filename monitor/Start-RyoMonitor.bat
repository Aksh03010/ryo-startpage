@echo off
setlocal

set "INSTALL_DIR=%LOCALAPPDATA%\RyoHome\Monitor"
set "MONITOR_SCRIPT=%INSTALL_DIR%\ryo_monitor.py"
set "MONITOR_URL=https://raw.githubusercontent.com/Aksh03010/ryo-startpage/main/monitor/ryo_monitor.py"

where py >nul 2>nul
if errorlevel 1 (
  echo Python 3 is required to run Ryo Monitor.
  echo Install Python for Windows from https://www.python.org/downloads/windows/
  pause
  exit /b 1
)

where curl.exe >nul 2>nul
if errorlevel 1 (
  echo curl.exe is required to download Ryo Monitor.
  echo Install Windows updates or download the helper manually from:
  echo https://raw.githubusercontent.com/Aksh03010/ryo-startpage/main/monitor/ryo_monitor.py
  pause
  exit /b 1
)

curl.exe --fail --silent --show-error --max-time 2 -H "Origin: https://aksh03010.github.io" "http://127.0.0.1:8765/api/metrics" --output NUL >nul 2>nul
if not errorlevel 1 (
  echo Ryo Monitor is already running and responding.
  pause
  exit /b 0
)

if not exist "%INSTALL_DIR%\" mkdir "%INSTALL_DIR%"
if not exist "%INSTALL_DIR%\" (
  echo Could not create the Ryo Monitor folder: %INSTALL_DIR%
  pause
  exit /b 1
)

echo Downloading the latest Ryo Monitor helper...
curl.exe --fail --location --silent --show-error "%MONITOR_URL%" --output "%MONITOR_SCRIPT%"
if errorlevel 1 (
  echo Download failed. Check your internet connection and try again.
  pause
  exit /b 1
)

echo Starting Ryo Monitor. Keep this window open while using the widget.
py -3 "%MONITOR_SCRIPT%"
if errorlevel 1 echo Ryo Monitor stopped with an error.
pause
