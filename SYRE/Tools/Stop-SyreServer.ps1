param(
    [int]$Port = 43213
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$pidFile = Join-Path $root '.syre-server.pid'

$candidateIds = New-Object System.Collections.Generic.List[int]

if (Test-Path -LiteralPath $pidFile) {
    $candidateIds.Add([int](Get-Content -LiteralPath $pidFile -Raw).Trim())
}

$listeners = @(
    Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalAddress -eq '127.0.0.1' }
)
foreach ($listener in $listeners) {
    if (-not $candidateIds.Contains([int]$listener.OwningProcess)) {
        $candidateIds.Add([int]$listener.OwningProcess)
    }
}

$matching = New-Object System.Collections.Generic.List[object]
foreach ($candidateId in @($candidateIds)) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $candidateId" -ErrorAction SilentlyContinue
    if ($null -eq $process) { continue }
    $commandLine = [string]$process.CommandLine
    if (
        ($process.Name -match '^python') -and
        ($commandLine -match 'http\.server') -and
        $commandLine.Contains($root) -and
        ($commandLine -match "(^|\s)$Port(\s|$)")
    ) {
        $matching.Add($process)
        $parent = Get-CimInstance Win32_Process -Filter "ProcessId = $($process.ParentProcessId)" -ErrorAction SilentlyContinue
        if ($null -ne $parent) {
            $parentCommandLine = [string]$parent.CommandLine
            if (
                ($parent.Name -match '^python') -and
                ($parentCommandLine -match 'http\.server') -and
                $parentCommandLine.Contains($root) -and
                ($parentCommandLine -match "(^|\s)$Port(\s|$)")
            ) {
                $matching.Add($parent)
            }
        }
    }
}

if ($matching.Count -eq 0) {
    if (Test-Path -LiteralPath $pidFile) {
        Remove-Item -LiteralPath $pidFile -Force
    }
    Write-Host 'No matching SYRE local-server process is running.'
    exit 0
}

$stopped = New-Object System.Collections.Generic.List[int]
foreach ($process in $matching | Sort-Object ProcessId -Unique) {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
    $stopped.Add([int]$process.ProcessId)
}
Start-Sleep -Milliseconds 300

$remaining = @(
    Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalAddress -eq '127.0.0.1' }
)
if ($remaining.Count -gt 0) {
    throw "Port $Port is still occupied; unmatched process was left untouched."
}

if (Test-Path -LiteralPath $pidFile) {
    Remove-Item -LiteralPath $pidFile -Force
}
Write-Host "SYRE server stopped (PID: $($stopped -join ', '))."
