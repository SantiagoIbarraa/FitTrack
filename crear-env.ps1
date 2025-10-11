# Script para crear archivo .env.local
# Ejecuta este script en PowerShell desde la raíz del proyecto

Write-Host "Creando archivo .env.local para FitTrack..." -ForegroundColor Green

$envContent = @"
# Google Gemini API Key (requerida para el asistente nutricional)
GOOGLE_GENERATIVE_AI_API_KEY=tu_clave_de_gemini_aqui

# Supabase Configuration (si usas Supabase)
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
"@

# Crear el archivo .env.local
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ Archivo .env.local creado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Abre el archivo .env.local" -ForegroundColor White
Write-Host "2. Reemplaza 'tu_clave_de_gemini_aqui' con tu API key real de Gemini" -ForegroundColor White
Write-Host "3. Reinicia el servidor con: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Para obtener tu API key de Gemini:" -ForegroundColor Cyan
Write-Host "   https://aistudio.google.com/" -ForegroundColor Blue
