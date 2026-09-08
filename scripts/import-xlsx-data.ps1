param(
  [Parameter(Mandatory = $true)]
  [string]$WorkbookPath,

  [string]$ConstantsPath = (Join-Path $PSScriptRoot '..\constants.ts')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-CellValue {
  param($Cell, $Namespace, $SharedStrings)

  if (-not $Cell) { return '' }
  if ($Cell.t -eq 'inlineStr') {
    return (($Cell.SelectNodes('.//x:t', $Namespace) | ForEach-Object { $_.InnerText }) -join '')
  }

  $valueNode = $Cell.SelectSingleNode('./x:v', $Namespace)
  if (-not $valueNode) { return '' }
  $value = $valueNode.InnerText
  if ($Cell.t -eq 's') { return $SharedStrings[[int]$value] }
  return $value
}

function Convert-ToTsvCell {
  param([AllowEmptyString()][string]$Value)

  $value = $Value -replace "`r`n", "`n" -replace "`r", "`n"
  if ($value -match '[\t\n"]') {
    return '"' + ($value -replace '"', '""') + '"'
  }
  return $value
}

$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $WorkbookPath))
try {
  $sharedStrings = @()
  $sharedEntry = $zip.GetEntry('xl/sharedStrings.xml')
  if ($sharedEntry) {
    $reader = [IO.StreamReader]::new($sharedEntry.Open())
    [xml]$sharedXml = $reader.ReadToEnd()
    $reader.Dispose()
    $sharedNs = [Xml.XmlNamespaceManager]::new($sharedXml.NameTable)
    $sharedNs.AddNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
    foreach ($item in $sharedXml.SelectNodes('//x:si', $sharedNs)) {
      $sharedStrings += (($item.SelectNodes('.//x:t', $sharedNs) | ForEach-Object { $_.InnerText }) -join '')
    }
  }

  $sheetEntry = $zip.GetEntry('xl/worksheets/sheet1.xml')
  if (-not $sheetEntry) { throw '找不到第一個工作表。' }
  $reader = [IO.StreamReader]::new($sheetEntry.Open())
  [xml]$sheetXml = $reader.ReadToEnd()
  $reader.Dispose()
  $sheetNs = [Xml.XmlNamespaceManager]::new($sheetXml.NameTable)
  $sheetNs.AddNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')

  $outputRows = [System.Collections.Generic.List[string]]::new()
  foreach ($row in $sheetXml.SelectNodes('//x:sheetData/x:row', $sheetNs)) {
    $cellsByColumn = @{}
    foreach ($cell in $row.SelectNodes('./x:c', $sheetNs)) {
      $column = $cell.r -replace '\d', ''
      $cellsByColumn[$column] = Get-CellValue $cell $sheetNs $sharedStrings
    }

    $values = [System.Collections.Generic.List[string]]::new()
    foreach ($columnNumber in 1..19) {
      $column = [char](64 + $columnNumber)
      $value = [string]$cellsByColumn[[string]$column]

      if ($row.r -gt 1 -and $column -eq 'F' -and $value) {
        $number = 0.0
        if ([double]::TryParse($value, [Globalization.NumberStyles]::Float, [Globalization.CultureInfo]::InvariantCulture, [ref]$number) -and $number -le 1) {
          $value = ($number * 100).ToString('0.##', [Globalization.CultureInfo]::InvariantCulture) + '%'
        }
      }
      if ($row.r -gt 1 -and $column -eq 'S' -and $value -match '^\d+(\.\d+)?$') {
        $value = ([datetime]'1899-12-30').AddDays([double]$value).ToString('yyyy-MM-dd')
      }
      if ($row.r -gt 1 -and ($column -eq 'B' -or $column -eq 'C') -and $value) {
        $number = [double]::Parse($value, [Globalization.CultureInfo]::InvariantCulture)
        $value = $number.ToString('0.##########', [Globalization.CultureInfo]::InvariantCulture)
      }

      $values.Add((Convert-ToTsvCell $value))
    }
    $outputRows.Add(($values -join "`t"))
  }

  $tsv = $outputRows -join "`r`n"
  $tsv = $tsv.Replace('`', '\`').Replace('${', '\${')
  $constants = [IO.File]::ReadAllText((Resolve-Path $ConstantsPath), [Text.Encoding]::UTF8)
  $marker = 'export const RAW_EXCEL_DATA = `'
  $start = $constants.IndexOf($marker)
  if ($start -lt 0) { throw 'constants.ts 中找不到 RAW_EXCEL_DATA。' }
  $updated = $constants.Substring(0, $start) + $marker + $tsv + ([char]96) + ";`r`n"
  [IO.File]::WriteAllText((Resolve-Path $ConstantsPath), $updated, [Text.UTF8Encoding]::new($false))

  Write-Output "Imported $($outputRows.Count - 1) rows through column S (參訪日期)."
}
finally {
  $zip.Dispose()
}
