param(
    [int]$Port = 43213,
    [switch]$OpenBrowser
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$pidFile = Join-Path $root '.syre-server.pid'
$stdout = Join-Path $root '.syre-server.out.log'
$stderr = Join-Path $root '.syre-server.err.log'
$url = "http://127.0.0.1:$Port/"

function Test-SyreEndpoint {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
        return ($response.StatusCode -eq 200) -and ($response.Content -match '<title>SYRE')
    } catch {
        return $false
    }
}

if (Test-SyreEndpoint) {
    $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalAddress -eq '127.0.0.1' } |
        Select-Object -First 1
    if ($null -ne $listener) {
        Set-Content -LiteralPath $pidFile -Value $listener.OwningProcess -Encoding ascii
    }
    Write-Host "SYRE server is already available: $url"
    if ($OpenBrowser) { Start-Process $url }
    exit 0
}

if (Test-Path -LiteralPath $pidFile) {
    Remove-Item -LiteralPath $pidFile -Force
}

$python = (Get-Command python -ErrorAction Stop).Source
$arguments = @('-m', 'http.server', "$Port", '--bind', '127.0.0.1', '--directory', $root)
$server = Start-Process -FilePath $python -ArgumentList $arguments -WindowStyle Hidden -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr

for ($attempt = 0; $attempt -lt 40; $attempt++) {
    Start-Sleep -Milliseconds 250
    if (Test-SyreEndpoint) {
        $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
            Where-Object { $_.LocalAddress -eq '127.0.0.1' } |
            Select-Object -First 1
        if ($null -eq $listener) {
            throw "SYRE endpoint responded, but no listener was found on port $Port."
        }
        Set-Content -LiteralPath $pidFile -Value $listener.OwningProcess -Encoding ascii
        Write-Host "SYRE server started: $url"
        Write-Host "PID: $($listener.OwningProcess)"
        if ($OpenBrowser) { Start-Process $url }
        exit 0
    }
}

throw "SYRE server did not become ready. See $stderr"
