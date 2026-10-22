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

if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
if errorlevel 1 (
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
