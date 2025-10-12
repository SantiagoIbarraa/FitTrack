# Sistema de Mensajería y Accesibilidad - FitTrack

## Nuevas Funcionalidades Agregadas

### 1. Sistema de Mensajería entre Usuarios

Se ha implementado un sistema completo de mensajería que permite la comunicación entre usuarios y profesionales seleccionados por el administrador.

#### Características:
- **Roles de usuario**: Usuario, Profesional, Administrador
- **Mensajería en tiempo real**: Los usuarios pueden enviar mensajes a profesionales activos
- **Panel de administración**: El administrador puede gestionar qué usuarios son profesionales y si están activos
- **Conversaciones**: Sistema de conversaciones para agrupar mensajes entre dos usuarios

#### Credenciales de Administrador:
- **Email**: juan@ejemplo.com
- **Contraseña**: 123456

**IMPORTANTE**: Primero debes crear el usuario administrador a través del sistema de registro normal, y luego ejecutar el script SQL para asignarle el rol de administrador.

### 2. Configuración de Accesibilidad

Se han agregado múltiples opciones de accesibilidad para hacer la aplicación más inclusiva:

#### Opciones disponibles:
- **Modo de Daltonismo**: 
  - Protanopía (dificultad con rojo-verde)
  - Deuteranopía (dificultad con rojo-verde)
  - Tritanopía (dificultad con azul-amarillo)
- **Alto Contraste**: Aumenta el contraste entre texto y fondo
- **Texto Grande**: Aumenta el tamaño del texto en toda la aplicación
- **Reducir Movimiento**: Minimiza animaciones y transiciones
- **Optimizado para Lectores de Pantalla**: Mejora la experiencia con tecnologías asistivas

## Scripts SQL a Ejecutar

### Paso 1: Crear las tablas del sistema de mensajería
Ejecuta el archivo: `scripts/11-create-messaging-system.sql`

Este script crea:
- Tabla `user_roles` para gestionar roles (usuario, profesional, admin)
- Tabla `messages` para almacenar mensajes
- Tabla `conversations` para agrupar conversaciones
- Tabla `user_preferences` para preferencias de accesibilidad
- Políticas RLS (Row Level Security) para proteger los datos
- Índices para mejorar el rendimiento

### Paso 2: Crear el usuario administrador
1. Primero, regístrate en la aplicación con el email: juan@ejemplo.com y contraseña: 123456
2. Luego ejecuta el archivo: `scripts/12-create-admin-user.sql`

Este script asigna el rol de administrador al usuario con email juan@ejemplo.com

## Nuevas Páginas y Funcionalidades

### 1. Panel de Administración (`/admin`)
- Solo accesible para usuarios con rol de administrador
- Permite ver todos los usuarios registrados
- Permite cambiar el rol de cualquier usuario (Usuario, Profesional, Administrador)
- Permite activar/desactivar usuarios profesionales
- Muestra estadísticas del sistema

### 2. Mensajes (`/messages`)
- Interfaz de mensajería para comunicarse con profesionales
- Lista de profesionales activos disponibles
- Chat en tiempo real con actualización automática cada 5 segundos
- Historial de mensajes

### 3. Configuración de Accesibilidad (`/accessibility`)
- Panel de configuración de opciones de accesibilidad
- Todas las preferencias se guardan en la base de datos
- Las preferencias se aplican automáticamente al guardar

## Cómo Usar el Sistema

### Para Administradores:
1. Inicia sesión con las credenciales de administrador
2. Ve al panel de administración desde la página principal
3. Selecciona usuarios y cámbiales el rol a "Profesional"
4. Activa o desactiva profesionales según sea necesario

### Para Usuarios:
1. Ve a la página de Mensajes
2. Selecciona un profesional de la lista
3. Envía mensajes y recibe respuestas en tiempo real

### Para Configurar Accesibilidad:
1. Ve a la página de Accesibilidad desde la página principal
2. Ajusta las opciones según tus necesidades
3. Haz clic en "Guardar Preferencias"
4. Las preferencias se aplicarán inmediatamente

## Notas Importantes

- El sistema de mensajería solo permite comunicación entre usuarios y profesionales activos
- Los administradores pueden ver y gestionar todos los usuarios
- Las preferencias de accesibilidad son personales y se guardan por usuario
- El modo de daltonismo utiliza filtros CSS para ajustar los colores
- El alto contraste mejora la legibilidad para personas con baja visión
- La opción de reducir movimiento es útil para personas sensibles a las animaciones

## Seguridad

- Todas las tablas tienen Row Level Security (RLS) habilitado
- Los usuarios solo pueden ver sus propios mensajes
- Los administradores tienen permisos especiales para gestionar roles
- Las preferencias de accesibilidad son privadas para cada usuario
