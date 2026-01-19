@echo off
setlocal EnableExtensions

REM Use portable Java 17
set "JAVA_HOME=%~dp0jdk-17.0.2"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo Using Java from: %JAVA_HOME%
java -version

echo.
echo Starting Spring Boot application...
echo.

REM Delegate to PowerShell runner (loads backend\local.env and runs Gradle bootRun)
for %%I in ("%~dp0..\scripts\run-backend.ps1") do set "PS_SCRIPT=%%~fI"
set "ENV_FILE=%~dp0local.env"
set "PS_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"

if not exist "%PS_SCRIPT%" goto :fallback
if not exist "%PS_EXE%" goto :fallback

REM Use Windows PowerShell explicitly to avoid cmd parsing issues
"%PS_EXE%" -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" -EnvFile "%ENV_FILE%"
goto :end

:fallback
echo (warn) PowerShell runner not available.
echo - script: %PS_SCRIPT%
echo - powershell: %PS_EXE%
echo Falling back to Gradle bootRun without env loading.
call "%~dp0gradlew.bat" bootRun

:end

endlocal
