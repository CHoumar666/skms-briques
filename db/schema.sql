-- Schéma Postgres (Supabase) pour SKMS Brique.
-- Peut être relancé sans risque (IF NOT EXISTS partout).

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('proprietaire', 'personnel')),
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fournisseurs (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  telephone TEXT
);

CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  telephone TEXT,
  adresse TEXT
);

CREATE TABLE IF NOT EXISTS livraisons (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  fournisseur_id INTEGER REFERENCES fournisseurs(id),
  quantite INTEGER NOT NULL,
  prix_unitaire INTEGER NOT NULL,
  notes TEXT,
  modele TEXT,
  statut_paiement TEXT NOT NULL DEFAULT 'paye' CHECK (statut_paiement IN ('paye', 'a_payer', 'sans_paiement')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ventes (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  client_id INTEGER REFERENCES clients(id),
  quantite INTEGER NOT NULL,
  prix_unitaire INTEGER NOT NULL,
  notes TEXT,
  modele TEXT,
  statut_paiement TEXT NOT NULL DEFAULT 'paye' CHECK (statut_paiement IN ('paye', 'a_encaisser')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('depense', 'revenu')),
  categorie TEXT NOT NULL,
  montant INTEGER NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  detail TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tentatives de connexion ratées, en base plutôt qu'en mémoire :
-- indispensable en hébergement serverless (chaque requête peut arriver sur
-- une machine différente, sans mémoire partagée entre elles).
CREATE TABLE IF NOT EXISTS login_attempts (
  cle TEXT PRIMARY KEY,
  nombre INTEGER NOT NULL DEFAULT 1,
  expire_a TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_livraisons_date ON livraisons (date DESC);
CREATE INDEX IF NOT EXISTS idx_ventes_date ON ventes (date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date DESC);
