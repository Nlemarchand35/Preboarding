---
# PREBOARDING — Projet Claude Code

## Contexte produit
Application SaaS B2B pour ETI françaises 300–2000 salariés.
Réduit le no-show J1 (absence du candidat à son premier jour).
Deux surfaces : dashboard recruteur (web, authentifié) + portail candidat (mobile, lien tokenisé, sans login).

## Stack imposée — ne pas en dévier
- Next.js 14 App Router, TypeScript strict
- Supabase (PostgreSQL + Auth + RLS)
- Tailwind CSS + shadcn/ui
- Resend (email transactionnel)
- Déploiement Vercel

## Conventions de nommage
- Composants React : PascalCase
- Fonctions / hooks : camelCase
- Fichiers : kebab-case
- Tables Supabase : snake_case, pluriel
- Variables d'environnement : .env.local uniquement, jamais hardcodées

## Ce qu'on ne construit pas en V1
- Intégration ATS (V2)
- SMS/WhatsApp (V2 via Vonage)
- Multi-langue
- Application native iOS/Android (PWA mobile suffit)
- Score, matching ou filtrage automatique de candidats (AI Act Annexe III)
- Analytics avancées
---
