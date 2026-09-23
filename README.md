# leo.portfolio2

Professional portfolio website for Leonardo Ferreira, prepared for **Cloudflare Pages** with a working contact form through **Cloudflare Pages Functions + Resend**.

## Project structure

```text
leo.portfolio2/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── assets/
│   ├── profile.jpg
│   └── favicon.svg
├── functions/
│   └── api/
│       └── contact.js
├── _headers
├── robots.txt
├── sitemap.xml
├── package.json
├── wrangler.toml
├── .dev.vars.example
└── .gitignore
```

## 1. Run locally — simple version

This is enough to view the website. It uses **port 8081**, so it will not conflict with another site already on 8080.

```powershell
cd C:\Users\LEOFERR\Desktop\leo.portfolio2
python -m http.server 8081
```

Open:

```text
http://localhost:8081
```

The website works, but the contact form API is not available in this simple Python server. The direct email link still works.

## 2. Run locally with the contact API

Install Node.js if needed. Copy `.dev.vars.example` to `.dev.vars` and add your Resend API key:

```powershell
copy .dev.vars.example .dev.vars
```

Then:

```powershell
npm run dev
```

Open:

```text
http://localhost:8788
```

This runs the site in an environment similar to Cloudflare Pages, including `/api/contact`.

## 3. Configure Resend

Create a Resend account and generate an API key. The only secret that must never be committed to GitHub is:

```text
RESEND_API_KEY
```

The default sender in `wrangler.toml` is:

```text
Leo Portfolio <onboarding@resend.dev>
```

That is useful for initial tests. For a production portfolio, verify your own domain in Resend and replace `CONTACT_FROM_EMAIL` with an address such as `Portfolio <contact@yourdomain.pt>`.

## 4. Publish with GitHub + Cloudflare Pages

Create a GitHub repository called `leo-portfolio2`, then from this folder:

```powershell
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/leo-portfolio2.git
git push -u origin main
```

In Cloudflare Dashboard:

1. **Workers & Pages → Create → Pages → Connect to Git**.
2. Select the `leo-portfolio2` repository.
3. Framework preset: **None**.
4. Build command: leave empty.
5. Build output directory: `.`
6. Deploy.

The default address should be similar to:

```text
https://leo-portfolio2.pages.dev
```

If Cloudflare assigns a different project URL, update `robots.txt` and `sitemap.xml` with the real URL.

## 5. Add the Resend secret in Cloudflare

In the Pages project, open **Settings → Variables and Secrets** and add:

```text
RESEND_API_KEY = your Resend API key
```

`CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` are already defined in `wrangler.toml`, but you can override them in Cloudflare if needed.

After changing variables/secrets, redeploy the site.

## 6. Custom domain

For a professional portfolio, connect a custom domain in **Cloudflare Pages → Custom domains**. Once the final domain is known, update the URL in:

- `robots.txt`
- `sitemap.xml`
- optionally add a canonical URL and Open Graph URL to `index.html`

## Contact form behaviour

The form sends a POST request to `/api/contact`. The server-side function validates the input, includes a honeypot against basic spam, sends the message through Resend, and sets the visitor's email as `Reply-To`, so replying from your inbox goes directly to the person who contacted you.

## Idiomas
O site inclui seletor **PT / EN** no cabeçalho. A escolha fica guardada no browser com `localStorage`, por isso o visitante mantém o idioma escolhido nas visitas seguintes.

A tradução está separada em `js/i18n.js`; a lógica geral continua em `js/main.js`.


## Cabeçalho responsivo
O cabeçalho foi otimizado para PT/EN: os textos não quebram em duas linhas no desktop e, em ecrãs mais estreitos, a navegação passa automaticamente para um menu responsivo.

## Header responsive
The navigation is tuned for both PT and EN. Full desktop navigation is shown on wide screens; the CTA is hidden on medium desktop widths and a hamburger menu takes over before labels can overlap.
