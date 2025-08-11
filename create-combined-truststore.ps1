# PowerShell script to create a combined truststore
# This script copies the system truststore and adds the GoDaddy certificate

Write-Host "Creating combined truststore with system certificates and GoDaddy certificate..."

# Find Java installation
$javaHome = $env:JAVA_HOME
if (-not $javaHome) {
    Write-Host "JAVA_HOME not set, trying to find Java installation..."
    $javaHome = (Get-Command java).Source | Split-Path -Parent | Split-Path -Parent
}

Write-Host "Using Java installation: $javaHome"

# Path to system truststore
$systemTruststore = "$javaHome\lib\security\cacerts"
$combinedTruststore = "certs\combined-truststore.jks"

# Check if system truststore exists
if (-not (Test-Path $systemTruststore)) {
    Write-Host "System truststore not found at: $systemTruststore"
    Write-Host "Creating empty truststore..."
    keytool -genkeypair -alias temp -keyalg RSA -keystore $combinedTruststore -storepass changeit -dname "CN=Temp" -validity 1
    keytool -delete -alias temp -keystore $combinedTruststore -storepass changeit
} else {
    Write-Host "Copying system truststore..."
    Copy-Item $systemTruststore $combinedTruststore
}

# Add GoDaddy certificate if it exists
if (Test-Path "certs\godaddy_ca.crt") {
    Write-Host "Adding GoDaddy certificate to combined truststore..."
    keytool -import -alias godaddy-ca -file certs\godaddy_ca.crt -keystore $combinedTruststore -storepass changeit -noprompt
} else {
    Write-Host "GoDaddy certificate not found, downloading..."
    Invoke-WebRequest -Uri "http://certificates.godaddy.com/repository/gdig2.crt" -OutFile "certs\godaddy_ca.crt"
    keytool -import -alias godaddy-ca -file certs\godaddy_ca.crt -keystore $combinedTruststore -storepass changeit -noprompt
}

Write-Host "Combined truststore created at: $combinedTruststore"
Write-Host "Listing certificates in combined truststore:"
keytool -list -keystore $combinedTruststore -storepass changeit | Select-String "godaddy-ca"
