# reeforge-ui

React + TypeScript admin UI for the [nexo-bk](../../php/nexo-bk) API (Reeforge Finance). Design system: `DESIGN.md` and `design/`.

```bash
cp .env.example .env     # NEXO_API_URL points the Vite proxy at nexo-bk
npm install
npm run dev              # http://localhost:5173, /api proxied to nexo-bk
npm test && npm run build
```

Backend local: `php artisan serve --host=127.0.0.1 --port=8000`. Staging: `https://api.backendnexo.shop`.

Screens: login · companies (create, rename, delete) · company → invoices (filter, detail with QR/journal, manual fiscalize), certificates (list, upload .p12), Xero (connect link, mapping, pending, disconnect).
