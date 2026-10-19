# Ristorante Sì Chef

Sito ufficiale del **Ristorante Sì Chef** — ristorante e pizzeria a Cerro Maggiore (MI), tra Legnano e Saronno. Cucina italiana, pesce fresco, pizza artigianale e menù pranzo.

Frontend React + Vite, API serverless su Vercel, database Postgres su Neon. Include un'area riservata completa per gestire menu, allergeni, prenotazioni, ordini, programma fedeltà, messaggi e contenuti senza toccare il codice.

**Live:** https://www.ristorantesichef.com
**Admin:** https://www.ristorantesichef.com/admin

---

## Stack

| Area | Tecnologie |
| --- | --- |
| Frontend | React 19, Vite 7, TypeScript, Tailwind CSS v4, React Router 7, lucide-react |
| API | Vercel Functions (`/api`), Node runtime |
| Database | Neon Postgres (`@neondatabase/serverless`, driver HTTP) |
| Auth | JWT in cookie `httpOnly` + bcrypt |
| Media | Vercel Blob (upload immagini dall'admin) |
| Deploy | GitHub + Vercel |

---

## Funzionalità

### Sito pubblico
- Hero cinematico con immagine, marquee e scroll reveal.
- **Menu** dinamico con ricerca, filtro per **14 allergeni UE** (esclusione), categorie e schede piatto.
- **Menu pranzo** con formule (menù del giorno, pizza & bibita, menù di terra e di mare, menù bimbi).
- **Ordini online** per asporto e domicilio: carrello persistente, orario di ritiro/consegna, minimo e costo di consegna, codice ordine.
- **Prenotazione** in 4 step: data → orario → zona → dettagli, con slot calcolati sugli orari reali e blocco delle date di chiusura.
- **Programma fedeltà**: iscrizione con codice tessera, saldo punti e movimenti.
- **Eventi e cerimonie** con form di richiesta preventivo.
- Galleria con lightbox, recensioni, mappa, orari, newsletter e pagina privacy.

### Area admin (`/admin`)
- **Dashboard**: coperti di oggi, ordini, incassi, messaggi nuovi, tessere fedeltà, piatti più ordinati.
- **Prenotazioni**: filtri per stato, cambio stato, note, eliminazione.
- **Ordini**: filtri per stato, dettaglio righe e totali, note interne, WhatsApp, eliminazione.
- **Menu & allergeni**: CRUD piatti, categorie, prezzi, disponibilità, allergeni, upload immagine.
- **Fedeltà**: elenco tessere, creazione manuale, rettifica punti con movimenti, sospensione, eliminazione.
- **Messaggi**: inbox con stati (nuovo/letto/risposto/archiviato) e risposta via email/WhatsApp.
- **Contenuti**: promo, eventi, galleria, orari di apertura, giorni di chiusura.
- **Impostazioni**: dati locale, hero, parametri prenotazione, ordini, programma fedeltà, SEO.

---

## Sviluppo locale

```bash
npm install
vercel link          # collega il progetto Vercel
vercel env pull .env.local
npm run db:setup     # crea schema, allergeni, categorie e menu iniziale
vercel dev           # sito + API su http://localhost:3000
```

In alternativa, per il solo frontend:

```bash
npm run dev          # Vite su :5173, con proxy /api -> :3000
```

### Variabili d'ambiente

| Variabile | Descrizione |
| --- | --- |
| `DATABASE_URL` | Connection string Neon (usa quella pooled) |
| `JWT_SECRET` | Segreto (min. 24 caratteri) per firmare i cookie di sessione |
| `BLOB_STORE_ID` | ID dello store Vercel Blob per gli upload |
| `BLOB_WEBHOOK_PUBLIC_KEY` | Chiave pubblica webhook Blob (opzionale) |

### Script

| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | Vite dev server (senza API) |
| `npm run build` | Typecheck + build di produzione |
| `npm run typecheck` | Solo TypeScript |
| `npm run db:setup` | Applica `db/schema.sql`, crea l'admin, inserisce il menu |

---

## Struttura

```
api/index.js         unica Vercel Function: instrada tutte le chiamate /api/*
server/api/          moduli degli endpoint (fuori da /api per il limite Hobby)
  _lib/              db, auth, http, rate limit
  admin/             endpoint protetti (dashboard, prenotazioni, ordini, fedeltà, messaggi, contenuti)
  content.js         payload pubblico unico (menu, promo, eventi, orari…)
  availability.js    slot liberi per data
  reservations.js    creazione + gestione prenotazioni
  orders.js          creazione + stato ordine
  loyalty.js         iscrizione + consultazione punti
  contact.js         messaggi dal form contatti
  newsletter.js      iscrizioni newsletter
  upload.js          upload immagini su Vercel Blob
db/schema.sql        schema completo + seed
scripts/             setup database
src/
  components/        layout, sezioni pubbliche, UI
  pages/             pagine del sito
  admin/             backoffice (pagine, layout, hook)
  lib/               api client, content provider, tipi, utils
public/assets/img/   immagini del sito
```

---

## API principali

| Metodo | Endpoint | Note |
| --- | --- | --- |
| GET | `/api/content` | Tutto il contenuto pubblico |
| GET | `/api/availability?date=YYYY-MM-DD` | Slot liberi per data |
| POST | `/api/reservations` | Nuova prenotazione (rate limited) |
| POST | `/api/orders` | Nuovo ordine (rate limited) |
| GET | `/api/orders?code=SC-XXXXXX` | Stato ordine tramite codice |
| POST | `/api/loyalty` | Iscrizione programma fedeltà |
| GET | `/api/loyalty?email=…&code=…` | Saldo punti e movimenti |
| POST | `/api/contact` | Messaggio dal form contatti |
| POST | `/api/newsletter` | Iscrizione newsletter |
| GET/POST/DELETE | `/api/auth` | Sessione admin |
| GET/POST/PATCH/DELETE | `/api/menu-items` | CRUD piatti (admin) |
| GET/POST/PATCH/DELETE | `/api/categories` | CRUD categorie (admin) |
| GET/PATCH/DELETE | `/api/admin/reservations` | Gestione prenotazioni |
| GET/PATCH/DELETE | `/api/admin/orders` | Gestione ordini |
| GET/POST/PATCH/DELETE | `/api/admin/loyalty` | Gestione tessere e punti |
| GET/PATCH/DELETE | `/api/admin/messages` | Gestione messaggi |
| GET/POST/PATCH/DELETE | `/api/admin/content` | Promo, eventi, galleria, orari, chiusure, impostazioni |
| GET | `/api/admin/dashboard` | Metriche dashboard |
| POST | `/api/upload` | Upload immagine (admin) |

---

## Deploy

Il deploy di produzione è automatico: ogni push su `main` esegue il workflow
`.github/workflows/deploy.yml` (GitHub Actions → `vercel build` + `vercel deploy --prod`).

In alternativa, da locale:

```bash
vercel --prod
```

Dopo il deploy verifica:

```bash
curl https://www.ristorantesichef.com/api/content
```

### Credenziali admin

- **Email:** `admin@ristorantesichef.com`
- **Password:** `SiChef2026!`

> Cambia la password di default prima di condividere l'URL pubblico.

---

## Sicurezza

- Password admin hashata con bcrypt (12 round).
- Sessione JWT in cookie `httpOnly`, `secure`, `sameSite=lax`, scadenza 7 giorni.
- Rate limiting su login, prenotazioni, ordini, fedeltà e messaggi.
- Tutti gli endpoint `/api/admin/*` e le mutazioni richiedono sessione valida.
