import "server-only";
import { MODELES, libelleModele } from "./modeles";
import db, { Client, Fournisseur, Livraison, StatutLivraison, StatutVente, Transaction, Vente } from "./db";

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

export type LivraisonAvecFournisseur = Livraison & { fournisseur_nom: string | null; saisi_par: string | null };

export function listLivraisons(): LivraisonAvecFournisseur[] {
  return db
    .prepare(
      `SELECT l.*, f.nom as fournisseur_nom, u.username as saisi_par
       FROM livraisons l
       LEFT JOIN fournisseurs f ON f.id = l.fournisseur_id
       LEFT JOIN users u ON u.id = l.created_by
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
  created_by: number;
  modele: string;
  statut_paiement: StatutLivraison;
}) {
  return db
    .prepare(
      `INSERT INTO livraisons (date, fournisseur_id, quantite, prix_unitaire, notes, created_by, statut_paiement, modele)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.date,
      input.fournisseur_id,
      input.quantite,
      input.prix_unitaire,
      input.notes || null,
      input.created_by,
      input.statut_paiement,
      input.modele
    );
}

export type VenteAvecClient = Vente & { client_nom: string | null; saisi_par: string | null };

export function listVentes(): VenteAvecClient[] {
  return db
    .prepare(
      `SELECT v.*, c.nom as client_nom, u.username as saisi_par
       FROM ventes v
       LEFT JOIN clients c ON c.id = v.client_id
       LEFT JOIN users u ON u.id = v.created_by
       ORDER BY v.date DESC, v.id DESC`
    )
    .all() as VenteAvecClient[];
}

export function listVentesParDate(date: string): VenteAvecClient[] {
  return db
    .prepare(
      `SELECT v.*, c.nom as client_nom, u.username as saisi_par
       FROM ventes v
       LEFT JOIN clients c ON c.id = v.client_id
       LEFT JOIN users u ON u.id = v.created_by
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
      `SELECT v.*, c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse, u.username as saisi_par
       FROM ventes v
       LEFT JOIN clients c ON c.id = v.client_id
       LEFT JOIN users u ON u.id = v.created_by
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
  created_by: number;
  modele: string;
  statut_paiement: StatutVente;
}) {
  return db
    .prepare(
      `INSERT INTO ventes (date, client_id, quantite, prix_unitaire, notes, created_by, statut_paiement, modele)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.date,
      input.client_id,
      input.quantite,
      input.prix_unitaire,
      input.notes || null,
      input.created_by,
      input.statut_paiement,
      input.modele
    );
}

export type TransactionAvecAuteur = Transaction & { saisi_par: string | null };

export function listTransactions(): TransactionAvecAuteur[] {
  return db
    .prepare(
      `SELECT t.*, u.username as saisi_par FROM transactions t
       LEFT JOIN users u ON u.id = t.created_by
       ORDER BY t.date DESC, t.id DESC`
    )
    .all() as TransactionAvecAuteur[];
}

export function createTransaction(input: {
  date: string;
  type: "depense" | "revenu";
  categorie: string;
  montant: number;
  description: string;
  created_by: number;
}) {
  return db
    .prepare(
      `INSERT INTO transactions (date, type, categorie, montant, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(input.date, input.type, input.categorie, input.montant, input.description || null, input.created_by);
}

export type SourceOperation = "livraison" | "vente" | "transaction";
const TABLES: Record<SourceOperation, string> = { livraison: "livraisons", vente: "ventes", transaction: "transactions" };

export function supprimerOperation(source: SourceOperation, id: number, userId: number): boolean {
  const table = TABLES[source];
  const ligne = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
  if (!ligne) return false;
  db.transaction(() => {
    db.prepare("INSERT INTO audit_log (user_id, action, detail) VALUES (?, ?, ?)").run(
      userId,
      `suppression_${source}`,
      JSON.stringify(ligne)
    );
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
  })();
  return true;
}

export type LigneComptable = {
  id: string;
  source: SourceOperation;
  refId: number;
  saisi_par: string | null;
  date: string;
  type: "depense" | "revenu";
  categorie: string;
  montant: number;
  description: string | null;
  statut: "paye" | "a_payer" | "a_encaisser" | "sans_paiement";
  compteEnCaisse: boolean;
};

export function setStatutPaiement(source: "livraison" | "vente", id: number, statut: string, userId: number): boolean {
  const valides = source === "livraison" ? ["paye", "a_payer", "sans_paiement"] : ["paye", "a_encaisser"];
  if (!valides.includes(statut)) return false;
  const table = TABLES[source];
  const avant = db.prepare(`SELECT statut_paiement FROM ${table} WHERE id = ?`).get(id) as { statut_paiement: string } | undefined;
  if (!avant) return false;
  db.transaction(() => {
    db.prepare(`UPDATE ${table} SET statut_paiement = ? WHERE id = ?`).run(statut, id);
    db.prepare("INSERT INTO audit_log (user_id, action, detail) VALUES (?, ?, ?)").run(
      userId,
      `paiement_${source}`,
      JSON.stringify({ id, avant: avant.statut_paiement, apres: statut })
    );
  })();
  return true;
}

export function getLedger(): LigneComptable[] {
  const lignes: LigneComptable[] = [];

  for (const l of listLivraisons()) {
    lignes.push({
      id: `livraison-${l.id}`,
      source: "livraison",
      refId: l.id,
      saisi_par: l.saisi_par,
      date: l.date,
      type: "depense",
      categorie: `Achat briques ${libelleModele(l.modele)}`,
      montant: l.quantite * l.prix_unitaire,
      description: l.fournisseur_nom ? `Fournisseur: ${l.fournisseur_nom}` : l.notes,
      statut: l.statut_paiement,
      compteEnCaisse: l.statut_paiement === "paye",
    });
  }

  for (const v of listVentes()) {
    lignes.push({
      id: `vente-${v.id}`,
      source: "vente",
      refId: v.id,
      saisi_par: v.saisi_par,
      date: v.date,
      type: "revenu",
      categorie: `Vente briques ${libelleModele(v.modele)}`,
      montant: v.quantite * v.prix_unitaire,
      description: v.client_nom ? `Client: ${v.client_nom}` : v.notes,
      statut: v.statut_paiement,
      compteEnCaisse: v.statut_paiement === "paye",
    });
  }

  for (const t of listTransactions()) {
    lignes.push({
      id: `transaction-${t.id}`,
      source: "transaction",
      refId: t.id,
      saisi_par: t.saisi_par,
      date: t.date,
      type: t.type,
      categorie: t.categorie,
      montant: t.montant,
      description: t.description,
      statut: "paye",
      compteEnCaisse: true,
    });
  }

  return lignes.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function somme(sql: string): number {
  return (db.prepare(sql).get() as { m: number }).m;
}

export function getStats() {
  const stockBriques = somme("SELECT COALESCE(SUM(quantite), 0) AS m FROM livraisons") - somme("SELECT COALESCE(SUM(quantite), 0) AS m FROM ventes");

  const argentEncaisse =
    somme("SELECT COALESCE(SUM(quantite * prix_unitaire), 0) AS m FROM ventes WHERE statut_paiement = 'paye'") +
    somme("SELECT COALESCE(SUM(montant), 0) AS m FROM transactions WHERE type = 'revenu'");
  const argentSorti =
    somme("SELECT COALESCE(SUM(quantite * prix_unitaire), 0) AS m FROM livraisons WHERE statut_paiement = 'paye'") +
    somme("SELECT COALESCE(SUM(montant), 0) AS m FROM transactions WHERE type = 'depense'");
  const aPayer = somme("SELECT COALESCE(SUM(quantite * prix_unitaire), 0) AS m FROM livraisons WHERE statut_paiement = 'a_payer'");
  const aEncaisser = somme("SELECT COALESCE(SUM(quantite * prix_unitaire), 0) AS m FROM ventes WHERE statut_paiement = 'a_encaisser'");

  return {
    stockBriques,
    argentEncaisse,
    argentSorti,
    soldeCaisse: argentEncaisse - argentSorti,
    aPayer,
    aEncaisser,
  };
}

export type StockModele = { id: string; label: string; stock: number };

export function getStockParModele(): StockModele[] {
  const entrees = db.prepare("SELECT modele, COALESCE(SUM(quantite), 0) AS q FROM livraisons GROUP BY modele").all() as { modele: string | null; q: number }[];
  const sorties = db.prepare("SELECT modele, COALESCE(SUM(quantite), 0) AS q FROM ventes GROUP BY modele").all() as { modele: string | null; q: number }[];
  const q = (rows: { modele: string | null; q: number }[], id: string | null) => rows.find((r) => r.modele === id)?.q ?? 0;

  const resultat: StockModele[] = MODELES.map((m) => ({ id: m.id, label: m.label, stock: q(entrees, m.id) - q(sorties, m.id) }));
  const ancien = q(entrees, null) - q(sorties, null);
  if (ancien !== 0) resultat.push({ id: "ancien", label: "Non précisé", stock: ancien });
  return resultat;
}

export function getStockModele(modele: string): number {
  return getStockParModele().find((m) => m.id === modele)?.stock ?? 0;
}
