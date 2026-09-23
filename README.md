# SKMS Brique — Gestion Briques

Application de gestion (livraisons, ventes, comptabilité) pour la briqueterie SKMS Brique.
Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (Postgres).

## Mise en route

### 1. Créer le projet Supabase

Sur [supabase.com](https://supabase.com), crée un projet. Dans **Connect → Transaction pooler**,
copie l'adresse `postgresql://...` et colle-la dans `.env.local` :

```
DATABASE_URL=postgresql://...
SESSION_SECRET=... (déjà généré, ne pas changer)
```

### 2. Créer les tables

```bash
npm run db:migrate
```

### 3. (Optionnel) Transférer les anciennes données locales

Si `data/gestion.db` existe encore (ancienne base locale) :

```bash
npm run db:migrer-donnees
```

### 4. Créer le compte du propriétaire

```bash
npm run set-password
```

### 5. Lancer le site

```bash
npm run dev
```

## Autres commandes

- `npm run build` — build de production (échoue volontairement si `DATABASE_URL` manque)
- `npm run lint` — vérification du code
