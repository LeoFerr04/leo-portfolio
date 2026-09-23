# leo.portfolio2

Portefólio profissional de Leonardo Ferreira, preparado para publicação no **Cloudflare Pages**, com formulário de contacto através de **Cloudflare Pages Functions + Resend**.

## Executar localmente

```powershell
cd C:\Users\LEOFERR\Desktop\leo.portfolio2
python -m http.server 8081
```

Depois abre `http://localhost:8081`.

## Publicação no Cloudflare Pages

Configuração recomendada:

```text
Framework preset: None
Build command: exit 0
Build output directory: .
Production branch: main
```

Em **Settings → Variables and secrets → Production**, mantém `RESEND_API_KEY`, `CONTACT_TO_EMAIL` e `CONTACT_FROM_EMAIL`. A `RESEND_API_KEY` deve ficar guardada como **Secret**.

## Idiomas

O site abre por defeito em **Português de Portugal (PT-PT)** e mantém o seletor **PT / EN**. Os textos dos dois idiomas estão em `js/i18n.js`.

## Atualizar o site online

```powershell
git add .
git commit -m "Atualizar portefólio"
git push origin main
```

O Cloudflare Pages fará automaticamente um novo deployment.
