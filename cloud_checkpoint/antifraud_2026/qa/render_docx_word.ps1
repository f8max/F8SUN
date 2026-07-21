#requires -Version 5.1

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$InputDocx,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$OutputPdf
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Resolve-AfExactPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return [System.IO.Path]::GetFullPath($Path)
    }

    return [System.IO.Path]::GetFullPath(
        [System.IO.Path]::Combine((Get-Location).Path, $Path)
    )
}

function Release-AfComObject {
    param(
        [AllowNull()]
        [object]$ComObject
    )

    if (
        $null -ne $ComObject -and
        [System.Runtime.InteropServices.Marshal]::IsComObject($ComObject)
    ) {
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($ComObject)
    }
}

$afWord = $null
$afDocument = $null
$afFields = $null
$afTocCollection = $null
$afToc = $null
$afResolvedOutput = $null
$afExitCode = 0
$afFailureMessage = $null
$afCleanupErrors = [System.Collections.Generic.List[string]]::new()

try {
    $afResolvedInput = Resolve-AfExactPath -Path $InputDocx
    $afResolvedOutput = Resolve-AfExactPath -Path $OutputPdf

    if (-not [System.IO.File]::Exists($afResolvedInput)) {
        throw "Input DOCX does not exist or is not a file: $afResolvedInput"
    }

    if (-not [System.StringComparer]::OrdinalIgnoreCase.Equals(
        [System.IO.Path]::GetExtension($afResolvedInput),
        '.docx'
    )) {
        throw "Input must have a .docx extension: $afResolvedInput"
    }

    if (-not [System.StringComparer]::OrdinalIgnoreCase.Equals(
        [System.IO.Path]::GetExtension($afResolvedOutput),
        '.pdf'
    )) {
        throw "Output must have a .pdf extension: $afResolvedOutput"
    }

    if ([System.IO.Directory]::Exists($afResolvedOutput)) {
        throw "Output PDF path points to a directory: $afResolvedOutput"
    }

    if ([System.IO.File]::Exists($afResolvedOutput)) {
        throw "Output PDF already exists; refusing to overwrite it: $afResolvedOutput"
    }

    $afOutputDirectory = [System.IO.Path]::GetDirectoryName($afResolvedOutput)
    if ([string]::IsNullOrWhiteSpace($afOutputDirectory)) {
        throw "Could not resolve the output directory from: $afResolvedOutput"
    }

    if ([System.IO.File]::Exists($afOutputDirectory)) {
        throw "Output directory path points to a file: $afOutputDirectory"
    }

    if (-not [System.IO.Directory]::Exists($afOutputDirectory)) {
        [void][System.IO.Directory]::CreateDirectory($afOutputDirectory)
    }

    $afResolvedOutputDirectory = (Get-Item -LiteralPath $afOutputDirectory).FullName
    $afResolvedOutput = [System.IO.Path]::Combine(
        $afResolvedOutputDirectory,
        [System.IO.Path]::GetFileName($afResolvedOutput)
    )

    $afWord = New-Object -ComObject Word.Application
    $afWord.Visible = $false
    $afWord.DisplayAlerts = 0
    $afWord.AutomationSecurity = 3
    $afWord.ScreenUpdating = $false

    # ConfirmConversions=false, ReadOnly=true, AddToRecentFiles=false.
    $afDocument = $afWord.Documents.Open($afResolvedInput, $false, $true, $false)

    $afFields = $afDocument.Fields
    [void]$afFields.Update()

    $afTocCollection = $afDocument.TablesOfContents
    for ($afIndex = 1; $afIndex -le $afTocCollection.Count; $afIndex++) {
        $afToc = $afTocCollection.Item($afIndex)
        try {
            [void]$afToc.Update()
        }
        finally {
            Release-AfComObject -ComObject $afToc
            $afToc = $null
        }
    }

    # wdExportFormatPDF = 17. The read-only document is never saved.
    $afDocument.ExportAsFixedFormat($afResolvedOutput, 17)

    if (
        -not [System.IO.File]::Exists($afResolvedOutput) -or
        (Get-Item -LiteralPath $afResolvedOutput).Length -le 0
    ) {
        throw "Word did not produce a non-empty PDF: $afResolvedOutput"
    }
}
catch {
    $afExitCode = 1
    $afFailureMessage = $_.Exception.Message
}
finally {
    if ($null -ne $afDocument) {
        try {
            # wdDoNotSaveChanges = 0.
            $afDocument.Close(0)
        }
        catch {
            $afCleanupErrors.Add("Failed to close DOCX without saving: $($_.Exception.Message)")
        }
    }

    if ($null -ne $afWord) {
        try {
            # All opened documents were already closed explicitly without saving.
            # Calling Quit without an optional COM argument avoids PowerShell 5.1
            # treating that argument as a by-reference parameter on some Word builds.
            $afWord.Quit()
        }
        catch {
            $afCleanupErrors.Add("Failed to quit Word: $($_.Exception.Message)")
        }
    }

    Release-AfComObject -ComObject $afToc
    Release-AfComObject -ComObject $afTocCollection
    Release-AfComObject -ComObject $afFields
    Release-AfComObject -ComObject $afDocument
    Release-AfComObject -ComObject $afWord

    $afToc = $null
    $afTocCollection = $null
    $afFields = $null
    $afDocument = $null
    $afWord = $null

    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()

    if ($afCleanupErrors.Count -gt 0) {
        $afExitCode = 1
        if ([string]::IsNullOrWhiteSpace($afFailureMessage)) {
            $afFailureMessage = $afCleanupErrors -join '; '
        }
        else {
            $afFailureMessage = $afFailureMessage + '; ' + ($afCleanupErrors -join '; ')
        }
    }
}

if ($afExitCode -ne 0) {
    [Console]::Error.WriteLine("DOCX visual-QA export failed: $afFailureMessage")
    exit $afExitCode
}

Write-Output $afResolvedOutput
exit 0
