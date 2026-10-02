$body = @{email="admin@gmail.com"; password="Admin@123"} | ConvertTo-Json
try {
    $result = Invoke-RestMethod -Method POST -Uri "http://localhost:5173/api/auth/login" -ContentType "application/json" -Body $body
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "ERROR STATUS: $($_.Exception.Response.StatusCode)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "ERROR BODY: $($reader.ReadToEnd())"
}
