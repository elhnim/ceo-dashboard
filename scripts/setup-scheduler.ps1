param(
  [string]$TaskName = "CEO Dashboard Codex Runner",
  [string]$GitBashPath = "C:\Program Files\Git\bin\bash.exe"
)

$ErrorActionPreference = "Stop"

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$runnerScript = Join-Path $scriptDirectory "codex-runner.sh"

if (-not (Test-Path -LiteralPath $runnerScript)) {
  throw "Runner script not found at $runnerScript"
}

if (-not (Test-Path -LiteralPath $GitBashPath)) {
  throw "Git Bash not found at $GitBashPath"
}

$runnerScriptUnix = $runnerScript -replace "\\", "/"
$actionArgs = "-lc `"cd '$($scriptDirectory -replace "\\", "/")' && '$runnerScriptUnix'`""

$action = New-ScheduledTaskAction -Execute $GitBashPath -Argument $actionArgs
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date -RepetitionInterval (New-TimeSpan -Minutes 10)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel LeastPrivilege

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null

Write-Host "Scheduled task registered: $TaskName"
Write-Host "Git Bash: $GitBashPath"
Write-Host "Runner: $runnerScript"
