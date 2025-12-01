# Copilot Instructions for AI Agents

## Arquitectura General
- Este proyecto es un backend Node.js con Express, estructurado por dominios: `controllers`, `models`, `routes`, `middleware`, y `Utils`.
- La lógica de negocio está en `controllers/`, los modelos de datos en `models/`, las rutas HTTP en `routes/`, y la configuración en `config/`.
- El archivo principal de entrada es `server.js`.

## Flujos de Datos y Componentes Clave
- Las rutas (`routes/`) definen los endpoints y delegan la lógica a los controladores.
- Los controladores (`controllers/`) gestionan la interacción entre las rutas y los modelos.
- Los modelos (`models/`) representan entidades de la base de datos (ej: `User`, `Student`, `Event`, `Payment`).
- Los middlewares (`middleware/`) gestionan autenticación (`auth.js`), subida de archivos (`upload.js`), etc.
- Utilidades (`Utils/`) contienen funciones auxiliares como generación de tokens.

## Convenciones Específicas
- Los nombres de archivos y carpetas son en inglés y en singular para modelos, plural para rutas.
- Los controladores suelen exportar funciones para cada acción CRUD.
- Los middlewares se aplican en las rutas según la necesidad (ejemplo: protección de rutas con `auth.js`).
- La configuración de servicios externos (ej: Cloudinary, base de datos) está en `config/`.

## Integraciones y Dependencias
- Uso de JWT para autenticación (ver `generateToken.js` y `middleware/auth.js`).
- Integración con Cloudinary para gestión de archivos (ver `config/cloudinary.js`).
- Conexión a base de datos configurada en `config/database.js`.

## Ejemplo de Flujo Típico
1. Una petición HTTP llega a una ruta definida en `routes/`.
2. Si la ruta requiere autenticación, se aplica el middleware `auth.js`.
3. El controlador correspondiente procesa la lógica y accede a los modelos.
4. Se usan utilidades según necesidad (ej: generación de token).
5. La respuesta se envía al cliente.

## Comandos y Workflows
- Para iniciar el servidor: `node server.js` o `npm start` (si está definido en `package.json`).
- No se detectan scripts de test ni convenciones de testing en la estructura actual.
- Debugging típico: modificar `server.js` y usar logs en controladores y middlewares.

## Ejemplos de Patrones
- Middleware de autenticación:
  ```js
  // routes/auth.js
  router.get('/profile', authMiddleware, authController.profile);
  ```
- Uso de modelos en controladores:
  ```js
  // controllers/studentController.js
  const Student = require('../models/Student');
  // ... lógica CRUD ...
  ```

## Archivos Clave
- `server.js`: punto de entrada principal.
- `config/`: configuración de servicios externos.
- `routes/`: definición de endpoints.
- `controllers/`: lógica de negocio.
- `models/`: entidades de datos.
- `middleware/`: lógica transversal (auth, upload).
- `Utils/`: utilidades generales.

---

Actualiza este documento si se agregan nuevas convenciones, integraciones o flujos importantes.
