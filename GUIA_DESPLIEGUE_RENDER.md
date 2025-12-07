# 🚀 Despliegue en Render - Guía Completa

## ✅ Archivos ya preparados:
- ✅ `system.properties` - Especifica Java 17
- ✅ `Procfile` - Comando para ejecutar la aplicación
- ✅ `application.properties` - Configurado con variables de entorno
- ✅ `pom.xml` - Driver PostgreSQL incluido
- ✅ Git commit realizado

---

## 📋 Pasos para desplegar en Render:

### 1️⃣ Subir código a GitHub

**Opción A: Crear repositorio nuevo en GitHub**
1. Ve a https://github.com/new
2. Nombre del repositorio: `alumnos-api` (o el que prefieras)
3. **NO marcar** "Initialize with README"
4. Click en **Create repository**

**Luego ejecuta estos comandos:**
```powershell
cd C:\Users\USUARIO\OneDrive\Escritorio\NetBeansProjects\ProyectoSOA\alumnos-api
git remote add origin https://github.com/TU_USUARIO/alumnos-api.git
git branch -M main
git push -u origin main
```

---

### 2️⃣ Crear Web Service en Render

1. Ve a: https://dashboard.render.com
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub:
   - Click **"Connect account"** si es la primera vez
   - Busca y selecciona el repositorio `alumnos-api`
   - Click **"Connect"**

4. **Configuración del servicio:**
   - **Name**: `alumnos-api` (o el que prefieras)
   - **Region**: Oregon (gratis)
   - **Branch**: `main`
   - **Root Directory**: (dejar vacío)
   - **Runtime**: Java
   - **Build Command**: `./mvnw clean install -DskipTests`
   - **Start Command**: `java -jar target/alumnos-api-0.0.1-SNAPSHOT.jar`
   - **Instance Type**: Free

---

### 3️⃣ Configurar Variables de Entorno en Render

Antes de hacer click en "Create Web Service", baja hasta la sección **Environment Variables** y agrega:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `jdbc:postgresql://dpg-d4qaqqili9vc739qs5t0-a.oregon-postgres.render.com:5432/soaproject` |
| `DATABASE_USERNAME` | `soauser` |
| `DATABASE_PASSWORD` | `7fvacRwnNV9fdJWYJtOpuavVHSyLTqE1` |
| `PORT` | (Render lo asigna automáticamente, no agregues esta) |

---

### 4️⃣ Desplegar

1. Click en **"Create Web Service"**
2. Render empezará a construir tu aplicación (toma ~5-10 minutos)
3. Verás logs en tiempo real

**Logs esperados:**
```
==> Downloading dependencies
==> Building with Maven
==> Deploying...
==> Your service is live 🎉
```

---

### 5️⃣ Obtener tu URL

Cuando termine el despliegue, Render te dará una URL como:

```
https://alumnos-api.onrender.com
```

**Accede a tu aplicación:**
- Login: `https://alumnos-api.onrender.com/login.html`
- Dashboard: `https://alumnos-api.onrender.com/index.html`

**Usuarios por defecto:**
- Admin: `admin` / `admin123`
- Secretaria: `secretaria` / `secretaria123`

---

## ⚠️ Importante:

1. **Primera carga lenta**: Las instancias gratuitas de Render se "duermen" después de 15 minutos de inactividad. La primera carga puede tomar ~1 minuto.

2. **Base de datos compartida**: Tu BD PostgreSQL en Render ya está configurada y funcionando.

3. **HTTPS automático**: Render proporciona certificado SSL gratis.

---

## 🐛 Solución de problemas:

**Si el build falla:**
- Revisa los logs en Render Dashboard
- Verifica que `mvnw` tenga permisos de ejecución
- Confirma que Java 17 esté especificado en `system.properties`

**Si no conecta a la BD:**
- Verifica las variables de entorno en Render
- Confirma que tu BD PostgreSQL esté activa en Render Dashboard

---

## 📱 Conectar la app Android:

En tu `ApiClient.java` cambia:
```java
private static final String BASE_URL = "https://alumnos-api.onrender.com/";
```

¡Listo! Tu app Android ahora consume la API en la nube 🚀
