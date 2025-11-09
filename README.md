# Nothelferkurs Zürich – Astro + Vercel

Schlanke Kursseite mit Buchungsformular und Mailgun-Bestätigungsmail.

## Deploy (Vercel)
1. Dieses Repo in GitHub pushen.
2. Auf Vercel: **Add New → Project → Import from Git** auswählen.
3. Env-Vars setzen:
   - `MAILGUN_DOMAIN` (z. B. `mg.example.com`)
   - `MAILGUN_API_KEY`
4. Deploy starten. API-Route liegt unter `/api/book`.

## Lokal
```bash
npm i
cp .env.example .env   # Env-Vars eintragen
npm run dev
```

## Struktur
- `src/pages/*.astro` – Seiten
- `src/pages/api/book.ts` – E-Mail-Versand via Mailgun
- `src/components/Layout.astro` – Layout + Meta/SEO
- `public/images/*` – Platzhalterbilder

## Embed (iframe)
Andere Seiten können die Termine so einbinden:
```html
<iframe src="https://nothelferkurs-zuerich.ch/embed/courses" width="100%" height="320" style="border:0;overflow:hidden" loading="lazy"></iframe>
```

## SEO
- `@astrojs/sitemap` erzeugt Sitemaps automatisch.
- `public/robots.txt` verweist auf die Sitemap.
- `public/llms.txt` vorhanden.
- JSON-LD (Event/EducationEvent) auf `/kurse`.

## E-Mail & Reminder
- Bestätigung sofort.
- Erinnerung 24h vor Start über Mailgun `o:deliverytime` (kein Cron nötig).

## Bot-Schutz (Cloudflare Turnstile)
Env-Vars in Vercel setzen:
- `PUBLIC_CF_TURNSTILE_SITE_KEY` (Site Key)
- `CF_TURNSTILE_SECRET` (Secret Key)

Siehe Cloudflare Turnstile-Dashboard. Das Formular sendet den Token an `/api/book`, dort wird serverseitig verifiziert.
