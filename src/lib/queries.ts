import "server-only";
import db, { Client, Fournisseur, Livraison, Transaction, Vente } from "./db";

export function listFournisseurs(): Fournisseur[] {
  return db.prepare("SELECT * FROM fournisseurs ORDER BY nom").all() as Fournisseur[];
}

export function createFournisseur(nom: string, telephone: string) {
  return db
    .prepare("INSERT INTO fournisseurs (nom, telephone) VALUES (?, ?)")
    .run(nom, telephone || null);
}

export function listClients(): Client[] {
  return db.prepare("SELECT * FROM clients ORDER BY nom").all() as Client[];
}

export function createClient(nom: string, telephone: string, adresse: string) {
  return db
    .prepare("INSERT INTO clients (nom, telephone, adresse) VALUES (?, ?, ?)")
    .run(nom, telephone || null, adresse || null);
}

export type LivraisonAvecFournisseur = Livraison & { fournisseur_nom: string | null };

export function listLivraisons(): LivraisonAvecFournisseur[] {
  return db
    .prepare(
      `SELECT l.*, f.nom as fournisseur_nom
       FROM livraisons l
       LEFT JOIN fournisseurs f ON f.id = l.fournisseur_id
       ORDER BY l.date DESC, l.id DESC`
    )
    .all() as LivraisonAvecFournisseur[];
}

export function createLivraison(input: {
  date: string;
  fournisseur_id: number | null;
  quantite: number;
  prix_unitaire: number;
  notes: string;
}) {
  return db
    .prepare(
      `INSERT INTO livraisons (date, fournisseur_id, quantite, prix_unitaire, notes)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      input.date,
      input.fournisseur_id,
      input.quantite,
      input.prix_unitaire,
      input.notes || null
    );
}

export type VenteAvecClient = Vente & { client_nom: string | null };

export function listVentes(): VenteAvecClient[] {
  return db
    .prepare(
      `SELECT v.*, c.nom as client_nom
       FROM ventes v
       LEFT JOIN clients c ON c.id = v.client_id
       ORDER BY v.date DESC, v.id DESC`
    )
    .all() as VenteAvecClient[];
}

export function listVentesParDate(date: string): VenteAvecClient[] {
  return db
    .prepare(
      `SELECT v.*, c.nom as client_nom
       FROM ventes v
       LEFT JOIN clients c ON c.id = v.client_id
       WHERE v.date = ?
       ORDER BY v.id DESC`
    )
    .all(date) as VenteAvecClient[];
}

export type VenteAvecClientDetail = VenteAvecClient & {
  client_telephone: string | null;
  client_adresse: string | null;
};

export function getVente(id: number): VenteAvecClientDetail | undefined {
  return db
    .prepare(
      `SELECT v.*, c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse
       FROM ventes v
       LEFT JOIN clients c ON c.id = v.client_id
       WHERE v.id = ?`
    )
    .get(id) as VenteAvecClientDetail | undefined;
}

export function createVente(input: {
  date: string;
  client_id: number | null;
  quantite: number;
  prix_unitaire: number;
  notes: string;
}) {
  return db
    .prepare(
      `INSERT INTO ventes (date, client_id, quantite, prix_unitaire, notes)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      input.date,
      input.client_id,
      input.quantite,
      input.prix_unitaire,
      input.notes || null
    );
}

export function listTransactions(): Transaction[] {
  return db.prepare("SELECT * FROM transactions ORDER BY date DESC, id DESC").all() as Transaction[];
}

export function createTransaction(input: {
  date: string;
  type: "depense" | "revenu";
  categorie: string;
  montant: number;
  description: string;
}) {
  return db
    .prepare(
      `INSERT INTO transactions (date, type, categorie, montant, description)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(input.date, input.type, input.categorie, input.montant, input.description || null);
}

export type LigneComptable = {
  id: string;
  date: string;
  type: "depense" | "revenu";
  categorie: string;
  montant: number;
  description: string | null;
};

export function getLedger(): LigneComptable[] {
  const lignes: LigneComptable[] = [];

  for (const l of listLivraisons()) {
    lignes.push({
      id: `livraison-${l.id}`,
      date: l.date,
      type: "depense",
      categorie: "Achat briques",
      montant: l.quantite * l.prix_unitaire,
      description: l.fournisseur_nom ? `Fournisseur: ${l.fournisseur_nom}` : l.notes,
    });
  }

  for (const v of listVentes()) {
    lignes.push({
      id: `vente-${v.id}`,
      date: v.date,
      type: "revenu",
      categorie: "Vente briques",
      montant: v.quantite * v.prix_unitaire,
      description: v.client_nom ? `Client: ${v.client_nom}` : v.notes,
    });
  }

  for (const t of listTransactions()) {
    lignes.push({
      id: `transaction-${t.id}`,
      date: t.date,
      type: t.type,
      categorie: t.categorie,
      montant: t.montant,
      description: t.description,
    });
  }

  return lignes.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getStats() {
  const totalLivraisons = db
    .prepare("SELECT COALESCE(SUM(quantite), 0) as q FROM livraisons")
    .get() as { q: number };
  const totalVentes = db
    .prepare("SELECT COALESCE(SUM(quantite), 0) as q FROM ventes")
    .get() as { q: number };

  const depensesLivraisons = db
    .prepare("SELECT COALESCE(SUM(quantite * prix_unitaire), 0) as m FROM livraisons")
    .get() as { m: number };
  const revenusVentes = db
    .prepare("SELECT COALESCE(SUM(quantite * prix_unitaire), 0) as m FROM ventes")
    .get() as { m: number };
  const autresDepenses = db
    .prepare("SELECT COALESCE(SUM(montant), 0) as m FROM transactions WHERE type = 'depense'")
    .get() as { m: number };
  const autresRevenus = db
    .prepare("SELECT COALESCE(SUM(montant), 0) as m FROM transactions WHERE type = 'revenu'")
    .get() as { m: number };

  const stockBriques = totalLivraisons.q - totalVentes.q;
  const totalDepenses = depensesLivraisons.m + autresDepenses.m;
  const totalRevenus = revenusVentes.m + autresRevenus.m;
  const solde = totalRevenus - totalDepenses;

  return {
    stockBriques,
    totalDepenses,
    totalRevenus,
    solde,
    depensesLivraisons: depensesLivraisons.m,
    revenusVentes: revenusVentes.m,
  };
}
