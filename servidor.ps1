# Servidor HTTP Local para Pokemon BlackBox
$port = 8000
$listener = $null

while ($port -lt 8010) {
    try {
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://127.0.0.1:$port/")
        $listener.Start()
        break
    } catch {
        if ($listener -ne $null) {
            $listener.Close()
            $listener = $null
        }
        $port++
    }
}

if ($listener -eq $null -or -not $listener.IsListening) {
    Write-Host "Erro: Nao foi possivel iniciar o servidor em nenhuma porta entre 8000 e 8009." -ForegroundColor Red
    pause
    exit
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "    POKEMON BLACKBOX - SERVIDOR LOCAL" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Servidor ativo em http://127.0.0.1:$port/" -ForegroundColor Green
Write-Host "A abrir o teu navegador padrao..." -ForegroundColor Gray
Write-Host "Pressione Ctrl+C para encerrar o servidor." -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan

# Abre o browser automaticamente
Start-Process "http://127.0.0.1:$port/"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }
        
        # Corrige caminhos e junta com a diretoria atual
        $localPath = Join-Path $PSScriptRoot $path
        
        if (Test-Path $localPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            
            # Content Type adequado para carregar CSS, JS e imagens
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $contentType = "text/plain"
            if ($ext -eq ".html") { $contentType = "text/html; charset=utf-8" }
            elseif ($ext -eq ".css") { $contentType = "text/css" }
            elseif ($ext -eq ".js") { $contentType = "application/javascript" }
            elseif ($ext -eq ".json") { $contentType = "application/json" }
            elseif ($ext -eq ".png") { $contentType = "image/png" }
            elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
            elseif ($ext -eq ".jfif") { $contentType = "image/jpeg" }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "[200] $path" -ForegroundColor Green
        } else {
            $response.StatusCode = 404
            Write-Host "[404] $path" -ForegroundColor Red
        }
        $response.Close()
    } catch {
        # Evita crash em caso de encerramento abrupto do cliente
    }
}
