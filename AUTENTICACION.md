# 🔐 Sistema de Autenticación Implementado

## Resumen de Cambios

Se ha implementado un sistema completo de autenticación con las siguientes características:

### ✅ Características de Seguridad

1. **Autenticación con JWT** (JSON Web Tokens)
   - Tokens seguros con expiración de 8 horas
   - Renovación automática en cada petición
   - Verificación de tokens en cada solicitud

2. **Contraseñas Cifradas**
   - Uso de bcrypt para cifrado de contraseñas
   - Hash seguro de 255 caracteres
   - Imposible recuperar la contraseña original

3. **Rutas Protegidas**
   - Todas las páginas principales requieren autenticación
   - Redirección automática al login si no hay sesión
   - Verificación de token en cada carga de página

4. **Sesión Persistente**
   - Token almacenado en localStorage
   - Sesión se mantiene entre recargas de página
   - Cierre de sesión manual disponible

---

## 📁 Archivos Creados/Modificados

### Backend
- ✅ `backend/requirements.txt` - Agregadas librerías Flask-JWT-Extended y Flask-Bcrypt
- ✅ `backend/models.py` - Modelo Admin para usuarios administradores
- ✅ `backend/routes/auth.py` - Rutas de autenticación (login, verify, register)
- ✅ `backend/app.py` - Configuración de JWT
- ✅ `backend/setup_auth.py` - Script para crear tabla y primer admin

### Frontend
- ✅ `frontend/src/pages/Login.tsx` - Página de inicio de sesión
- ✅ `frontend/src/components/PrivateRoute.tsx` - Componente de rutas protegidas
- ✅ `frontend/src/services/api.ts` - Interceptores JWT
- ✅ `frontend/src/App.tsx` - Rutas protegidas
- ✅ `frontend/src/components/Navbar.tsx` - Botón de cerrar sesión

---

## 🚀 Instrucciones de Configuración

### Paso 1: Instalar Dependencias del Backend

```bash
cd backend
pip install -r requirements.txt
```

### Paso 2: Configurar la Clave Secreta JWT

Agrega esta línea a tu archivo `.env` en el backend:

```env
JWT_SECRET_KEY=tu-clave-secreta-muy-segura-y-larga-cambiar-en-produccion-123456
```

**IMPORTANTE:** Genera una clave secreta fuerte y única para producción.

### Paso 3: Crear la Tabla de Administradores

Ejecuta el script de configuración:

```bash
cd backend
python setup_auth.py
```

Este script te pedirá:
- **Usuario:** El nombre de usuario para login (ej: `admin`)
- **Contraseña:** Una contraseña segura (mínimo 6 caracteres)
- **Nombre completo:** Tu nombre (opcional)

**Ejemplo de ejecución:**
```
Usuario (ej: admin): admin
Contraseña: MiContraseña123!
Nombre completo (opcional): Administrador Principal
```

### Paso 4: Verificar la Configuración

El script mostrará un resumen de los administradores creados:

```
=== Administradores registrados ===
Total: 1 administrador(es)
--------------------------------------------------------------------------------
ID: 1
  Usuario: admin
  Nombre: Administrador Principal
  Creado: 2025-11-21 22:00:00
--------------------------------------------------------------------------------
```

### Paso 5: Configurar Variable de Entorno en Render

En tu dashboard de Render, agrega la variable de entorno:

- **Key:** `JWT_SECRET_KEY`
- **Value:** La misma clave secreta que pusiste en tu `.env` local

### Paso 6: Desplegar los Cambios

```bash
git add .
git commit -m "Implementar sistema de autenticación con JWT"
git push
```

---

## 🔑 Uso del Sistema

### Iniciar Sesión

1. Abre la aplicación en tu navegador
2. Serás redirigido automáticamente a `/login`
3. Ingresa tu usuario y contraseña
4. Haz clic en "Iniciar Sesión"

### Cerrar Sesión

- **Desktop:** Haz clic en el botón "Salir" en la esquina superior derecha
- **Móvil:** Abre el menú hamburguesa y selecciona "Cerrar Sesión"

### Crear Más Administradores

Puedes ejecutar el script `setup_auth.py` nuevamente para crear más usuarios administradores:

```bash
python setup_auth.py
```

---

## 🛡️ Seguridad Implementada

### Protección de Rutas

Todas estas rutas ahora requieren autenticación:
- `/` - Dashboard
- `/reportes` - Reporte de Asistencias
- `/analiticas` - Analíticas
- `/usuarios` - Gestión de Usuarios

### Manejo de Tokens

- **Expiración:** 8 horas
- **Almacenamiento:** localStorage (solo en el navegador del usuario)
- **Transmisión:** Header `Authorization: Bearer <token>`
- **Verificación:** En cada petición al backend

### Contraseñas

- **Cifrado:** bcrypt con salt automático
- **Hash:** 255 caracteres
- **Verificación:** Comparación segura sin exponer la contraseña

---

## 🔧 Solución de Problemas

### Error: "JWT_SECRET_KEY no está configurada"

**Solución:** Agrega la variable `JWT_SECRET_KEY` a tu archivo `.env`

### Error: "Credenciales inválidas"

**Solución:** Verifica que el usuario y contraseña sean correctos. Puedes crear un nuevo usuario con `setup_auth.py`

### La sesión expira muy rápido

**Solución:** Puedes aumentar el tiempo de expiración en `backend/app.py`:

```python
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 28800  # 8 horas (en segundos)
```

### No puedo acceder después de desplegar

**Solución:** Asegúrate de:
1. Haber ejecutado `setup_auth.py` en la base de datos de producción
2. Haber configurado `JWT_SECRET_KEY` en Render
3. Haber creado al menos un usuario administrador

---

## 📝 Notas Importantes

1. **Primera vez:** Debes ejecutar `setup_auth.py` para crear la tabla y el primer usuario
2. **Producción:** Cambia `JWT_SECRET_KEY` a una clave segura y única
3. **Seguridad:** No compartas tu clave secreta JWT ni la subas a Git
4. **Contraseñas:** Usa contraseñas fuertes para los administradores
5. **Backup:** Guarda las credenciales de admin en un lugar seguro

---

## 🎯 Próximos Pasos Opcionales

- [ ] Implementar recuperación de contraseña
- [ ] Agregar autenticación de dos factores (2FA)
- [ ] Implementar roles de usuario (admin, moderador, etc.)
- [ ] Agregar logs de inicio de sesión
- [ ] Implementar límite de intentos de login

---

¿Necesitas ayuda? Revisa los logs del servidor o contacta al desarrollador.
