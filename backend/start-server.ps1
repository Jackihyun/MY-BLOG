$env:JAVA_HOME = Join-Path $PSScriptRoot "jdk-17.0.2"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Load local.env
$envFile = Join-Path $PSScriptRoot "local.env"
if (Test-Path $envFile) {
    Write-Host "Loading env from: $envFile"
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $idx = $line.IndexOf("=")
            if ($idx -gt 0) {
                $key = $line.Substring(0, $idx).Trim()
                $value = $line.Substring($idx + 1).Trim()
                if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                    $value = $value.Substring(1, $value.Length - 2)
                }
                Set-Item -Path "Env:\$key" -Value $value
            }
        }
    }
}

Write-Host "Using JAVA_HOME: $env:JAVA_HOME"
Write-Host "ADMIN_PASSWORD is set: $($env:ADMIN_PASSWORD -ne $null)"
java -version

Set-Location $PSScriptRoot
& .\gradlew.bat bootRun
