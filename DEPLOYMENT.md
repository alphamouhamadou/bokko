# Allô Dakar - Configuration de déploiement

## Configuration Vercel (Production)

### Base de données
La base de données SQLite doit être migrée vers un service cloud pour la production.
Recommandé: **Turso** (SQLite cloud) ou **PlanetScale** (MySQL) ou **Supabase** (PostgreSQL).

### Variables d'environnement à configurer sur Vercel :
```
DATABASE_URL="file:./db/custom.db"           # Dev (SQLite local)
# DATABASE_URL="mysql://user:pass@host:3306/db"  # Prod (MySQL)
# DATABASE_URL="postgresql://..."                # Prod (PostgreSQL)
NEXTAUTH_SECRET="votre-secret-aleatoire-32-caracteres"
NEXTAUTH_URL="https://allo-dakar.vercel.app"
```

## Étapes de déploiement Vercel

### 1. Préparer le dépôt GitHub
```bash
git init
git add .
git commit -m "Initial commit - Allô Dakar"
git remote add origin https://github.com/VOTRE-USER/allo-dakar.git
git push -u origin main
```

### 2. Déployer sur Vercel
1. Aller sur https://vercel.com
2. "New Project" → Importer le dépôt GitHub
3. Framework Preset: Next.js (auto-détecté)
4. Configurer les variables d'environnement
5. Cliquer "Deploy"

### 3. Domaine personnalisé (optionnel)
1. Dans Vercel → Settings → Domains
2. Ajouter votre domaine (ex: allodakar.sn)
3. Configurer DNS chez votre registraire

## Déploiement Docker (Alternative)

### Dockerfile
```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN corepack enable && bun install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN bun run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "server.js"]
```

## PWA - Installation sur Mobile

### Android (Chrome)
1. Visiter le site web
2. Une bannière "Installer Allô Dakar" apparaît automatiquement
3. Cliquer "Installer"
4. L'app apparaît sur l'écran d'accueil

### iOS (Safari)
1. Visiter le site web dans Safari
2. Cliquer sur l'icône Partager (carré avec flèche)
3. Sélectionner "Sur l'écran d'accueil"
4. Cliquer "Ajouter"
5. L'app apparaît sur l'écran d'accueil

## Migration vers une vraie base de données (Production)

### Option A: Turso (SQLite Cloud) - Recommandé
1. Créer un compte sur https://turso.tech
2. Créer une base de données
3. Obtenir la URL de connexion
4. Modifier le provider dans prisma/schema.prisma
5. Mettre à jour DATABASE_URL

### Option B: Supabase (PostgreSQL + Auth + Storage)
1. Créer un compte sur https://supabase.com
2. Créer un projet
3. Obtenir les identifiants
4. Changer le provider Prisma en "postgresql"
5. Exécuter les migrations

### Option C: Planetscale (MySQL)
1. Créer un compte sur https://planetscale.com
2. Créer une base de données
3. Changer le provider Prisma en "mysql"
4. Mettre à jour DATABASE_URL
