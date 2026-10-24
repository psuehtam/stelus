# Liga o MySQL local no Windows (serviço MySQL80).
# Uso (já dentro do PowerShell, na raiz do repositório):
#   Set-ExecutionPolicy -Scope Process Bypass
#   .\scripts\start-mysql.ps1

$ErrorActionPreference = "Stop"
$serviceName = "MySQL80"

$svc = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if (-not $svc) {
  Write-Host "Servico '$serviceName' nao encontrado. Servicos MySQL neste PC:"
  Get-Service -Name "*mysql*" -ErrorAction SilentlyContinue | Format-Table Name, Status, StartType -AutoSize
  Write-Host "Se o nome for outro (ex.: MySQL57), edite `$serviceName neste script."
  exit 1
}

Write-Host "MySQL: $($svc.Name)  status=$($svc.Status)  startType=$($svc.StartType)"

if ($svc.StartType -ne "Automatic") {
  Write-Host "Definindo para iniciar junto com o Windows (pode pedir UAC)..."
  try {
    Set-Service -Name $serviceName -StartupType Automatic
  } catch {
    Start-Process -FilePath "powershell.exe" -Verb RunAs -Wait -ArgumentList @(
      "-NoProfile",
      "-Command",
      "Set-Service -Name '$serviceName' -StartupType Automatic"
    )
  }
}

if ($svc.Status -eq "Running") {
  Write-Host "MySQL ja esta rodando."
  exit 0
}

Write-Host "Iniciando MySQL..."
try {
  Start-Service -Name $serviceName
} catch {
  Start-Process -FilePath "C:\Windows\System32\net.exe" -ArgumentList "start", $serviceName -Verb RunAs -Wait
}

$after = Get-Service -Name $serviceName
if ($after.Status -ne "Running") {
  Write-Host "Nao deu para iniciar. Abra o PowerShell como Administrador e rode:"
  Write-Host "  net start $serviceName"
  exit 1
}

Write-Host "MySQL iniciado. Pronto para o restante do README."
