MiChan — servidor local de desarrollo
===================================

Este directorio contiene una implementación mínima de servidor para desarrollo local.

Archivos importantes:

- `server.js` — servidor Express que sirve los archivos estáticos y expone endpoints API.
- `package.json` — dependencias y script de inicio.

Endpoints disponibles:

- `GET /api/stats` — devuelve estadísticas (demo).
- `GET /api/threads` — lista de hilos actuales (in-memory).
- `POST /api/threads` — crear nuevo hilo: `{ author, title, content, tags }`.
- `GET /api/notifications` — lista de notificaciones.
- `POST /api/notifications/clear` — limpia las notificaciones.

Ejecutar localmente:

```bash
npm install
npm start
```

Luego abre `http://localhost:3000` en tu navegador.
