param(
  [string]$EnvFile = (Join-Path $PSScriptRoot "..\backend\local.env")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Load-EnvFile([string]$PathToEnv) {
  if (-not (Test-Path -LiteralPath $PathToEnv)) {
    $example = (Join-Path (Split-Path -Parent $PathToEnv) "local.env.example")
    throw "환경변수 파일을 찾을 수 없습니다: $PathToEnv`n예시 파일: $example`n예시를 복사해서 local.env를 만든 뒤 값을 채워주세요."
  }

  $lines = Get-Content -LiteralPath $PathToEnv
  foreach ($line in $lines) {
    $trim = $line.Trim()
    if ($trim.Length -eq 0) { continue }
    if ($trim.StartsWith("#")) { continue }

    $idx = $trim.IndexOf("=")
    if ($idx -lt 1) { continue }

    $key = $trim.Substring(0, $idx).Trim()
    $value = $trim.Substring($idx + 1).Trim()

    # strip surrounding quotes if present
    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    if ($key.Length -eq 0) { continue }
    Set-Item -Path ("Env:\" + $key) -Value $value
  }
}

Write-Host "Loading env from: $EnvFile"
Load-EnvFile $EnvFile

$backendDir = Join-Path $PSScriptRoot "..\backend"
Push-Location $backendDir
try {
  Write-Host "Starting backend (Gradle bootRun) from: $backendDir"
  & .\gradlew.bat bootRun
} finally {
  Pop-Location
}

