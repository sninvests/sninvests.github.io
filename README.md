# S N Investments

Static site (HTML/CSS/JS). No build step. Hosted on GitHub Pages. All files sit in one folder on purpose, so it uploads from any device.

## Settings
Open `config.js` to change phone, WhatsApp, email, address, ARN, videos. Empty fields stay hidden.

## Deploy (GitHub Pages)
1. New repo on GitHub, then Add file > Upload files, select every file in this folder, commit to `main`.
2. Settings > Pages > Deploy from a branch > `main` / `(root)` > Save.
3. `CNAME` already contains `www.sninvestments.in`. At the domain registrar add a CNAME record: `www` -> `<github-username>.github.io`. Tick Enforce HTTPS once it appears.
