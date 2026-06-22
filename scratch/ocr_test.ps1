try {
    # Initialize WinRT classes
    [void][System.Reflection.Assembly]::LoadWithPartialName("System.Runtime.WindowsRuntime")
    
    # Load WinRT classes
    $null = [Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType = WindowsRuntime]
    $null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
    $null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]

    # Get OCR engine for English
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
    if ($null -eq $engine) {
        Write-Error "Could not create OcrEngine"
        exit 1
    }

    # Load image file
    $filePath = "c:\Users\nicho\OneDrive\Documents\Web Development\Aroid Atlas AG\AroidAtlas\Finished Plates\ChatGPT Image Jun 21, 2026, 12_24_59 PM.png"
    $asyncOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($filePath)
    while ($asyncOp.Status -eq [Windows.Foundation.AsyncStatus]::Started) {
        Start-Sleep -Milliseconds 10
    }
    $storageFile = $asyncOp.GetResults()

    # Open stream
    $streamAsync = $storageFile.OpenAsync([Windows.Storage.FileAccessMode]::Read)
    while ($streamAsync.Status -eq [Windows.Foundation.AsyncStatus]::Started) {
        Start-Sleep -Milliseconds 10
    }
    $stream = $streamAsync.GetResults()

    # Decode bitmap
    $decoderAsync = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
    while ($decoderAsync.Status -eq [Windows.Foundation.AsyncStatus]::Started) {
        Start-Sleep -Milliseconds 10
    }
    $decoder = $decoderAsync.GetResults()

    # Get software bitmap
    $bitmapAsync = $decoder.GetSoftwareBitmapAsync()
    while ($bitmapAsync.Status -eq [Windows.Foundation.AsyncStatus]::Started) {
        Start-Sleep -Milliseconds 10
    }
    $softwareBitmap = $bitmapAsync.GetResults()

    # OCR it
    $ocrAsync = $engine.RecognizeAsync($softwareBitmap)
    while ($ocrAsync.Status -eq [Windows.Foundation.AsyncStatus]::Started) {
        Start-Sleep -Milliseconds 10
    }
    $result = $ocrAsync.GetResults()

    Write-Output "OCR Result:"
    Write-Output $result.Text
} catch {
    Write-Error $_.Exception.ToString()
}
