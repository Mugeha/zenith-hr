# Zenith HR

Zenith HR is a fictional Enterprise HR & Payroll SaaS application, deliberately built with real,
exploitable vulnerabilities for hands-on security practice. It is an official Africahackon
practice platform.

Zenith HR is not a real company or product, and contains no real employee, customer, or company
data. Every record is synthetic.

Full rules of engagement: `/rules-of-engagement` in the running app.

## Running this on any machine

Requires Docker and the `docker compose` CLI.

```bash
git clone <your-repo-url> zenith-hr   # or copy the folder over some other way
cd zenith-hr
cp .env.example .env
```

Open `.env` and set `POSTGRES_PASSWORD` and `JWT_SECRET` to random values (`openssl rand -hex 24`
works well for both). Then:

```bash
docker compose up -d --build
```

First run only, apply the database schema and load the seed data:

```bash
docker compose exec api npx prisma db push --accept-data-loss
docker compose exec api npm run seed
```

The app is now at `http://localhost`. Seeded login (all accounts): password `ZenithDemo!2026`,
e.g. `super.admin@zenithhr-demo.test`. Self-service signup is also available at `/signup`.

## Reset

`scripts/reset.sh` wipes uploaded files and re-seeds the database from the fixed demo dataset.
