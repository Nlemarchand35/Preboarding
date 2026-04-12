# Preboarding

Application SaaS B2B pour réduire le taux de no-show J1 dans les ETI françaises.

## Installation en 5 étapes

### 1. Cloner et installer les dépendances

```bash
git clone <repo-url>
cd preboarding
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.local.example .env.local
```

Renseignez les valeurs dans `.env.local` :

| Variable | Description | Où la trouver |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase | Supabase > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase | Supabase > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role Supabase | Supabase > Settings > API |
| `RESEND_API_KEY` | Clé API Resend | resend.com/api-keys |
| `NEXT_PUBLIC_APP_URL` | URL de l'app (localhost en dev) | — |

### 3. Initialiser la base de données Supabase

Dans l'éditeur SQL de votre projet Supabase, exécutez le fichier :

```
supabase/migrations/001_initial_schema.sql
```

Ou via la CLI Supabase :

```bash
supabase db push
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

### 5. Créer votre premier compte recruteur

1. Accédez à `/login` et créez un compte via magic link
2. Dans Supabase, insérez une entreprise dans la table `companies`
3. Insérez votre utilisateur dans la table `recruiters` en liant votre `auth.user.id`

## Structure du projet

```
app/
├── (auth)/login/          # Page de connexion
├── (dashboard)/dashboard/ # Dashboard recruteur
├── onboard/[token]/       # Portail candidat (public)
└── api/
    ├── send-welcome/      # Envoi email de bienvenue
    └── hires/[token]/     # Confirmation de présence
components/ui/             # Composants shadcn/ui
lib/supabase/              # Clients Supabase (browser, server, admin)
supabase/migrations/       # Schéma SQL
types/                     # Types TypeScript
```

## Stack technique

- **Next.js 14** — App Router, Server Components
- **Supabase** — PostgreSQL, Auth, Row Level Security
- **Tailwind CSS + shadcn/ui** — Interface
- **Resend** — Emails transactionnels
- **Vercel** — Déploiement
