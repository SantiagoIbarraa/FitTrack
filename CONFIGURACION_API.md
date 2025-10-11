# Configuración de Variables de Entorno para FitTrack

## Archivo .env.local requerido

Crea un archivo llamado `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# Google Gemini API Key (requerida para el asistente nutricional)
GOOGLE_GENERATIVE_AI_API_KEY=tu_clave_de_gemini_aqui

# Supabase Configuration (si usas Supabase)
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## Cómo obtener la API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Get API Key" en el menú lateral
4. Crea una nueva API key
5. Copia la clave generada
6. Pégala en tu archivo `.env.local` reemplazando `tu_clave_de_gemini_aqui`

## Verificación

Después de crear el archivo `.env.local`:

1. Reinicia el servidor de desarrollo: `npm run dev`
2. Ve a la página `/meals` 
3. Prueba el asistente nutricional

## Solución de Problemas

### Error: "API key no configurada"
- Verifica que el archivo `.env.local` existe en la raíz del proyecto
- Confirma que la variable se llama exactamente `GOOGLE_GENERATIVE_AI_API_KEY`
- Reinicia el servidor después de crear/modificar el archivo

### Error: "Error de configuración de API"
- Verifica que la API key es válida
- Confirma que tienes acceso a la API de Gemini
- Revisa que no hay espacios extra en la clave

### Error: "Límite de cuota excedido"
- Has alcanzado el límite de requests de tu API key
- Espera un poco o considera actualizar tu plan de Google AI
