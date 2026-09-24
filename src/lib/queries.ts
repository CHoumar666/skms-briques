import "server-only";
import { MODELES, libelleModele } from "./modeles";
import sql, { Client, Fournisseur, Livraison, StatutLivraison, StatutVente, Transaction, Vente } from "./db";

export async function listFournisseurs(): Promise<Fournisseur[]> {
  return sql<Fournisseur[]>`SELECT * FROM fournisseurs ORDER BY nom`;
}

export async function createFournisseur(nom: string, telephone: string) {
  const [row] = await sql<{ id: number }[]>`
    INSERT INTO fournisseurs (nom, telephone) VALUES (${nom}, ${telephone || null}) RETURNING id
  `;
  return row;
}

export async function listClients(): Promise<Client[]> {
  return sql<Client[]>`SELECT * FROM clients ORDER BY nom`;
}

export async function createClient(nom: string, telephone: string, adresse: string) {
  const [row] = await sql<{ id: number }[]>`
    INSERT INTO clients (nom, telephone, adresse) VALUES (${nom}, ${telephone || null}, ${adresse || null}) RETURNING id
  `;
  return row;
}

export type LivraisonAvecFournisseur = Livraison & { fournisseur_nom: string | null; saisi_par: string | null };

export async function listLivraisons(): Promise<LivraisonAvecFournisseur[]> {
  return sql<LivraisonAvecFournisseur[]>`
    SELECT l.*, f.nom as fournisseur_nom, u.username as saisi_par
    FROM livraisons l
    LEFT JOIN fournisseurs f ON f.id = l.fournisseur_id
    LEFT JOIN users u ON u.id = l.created_by
    ORDER BY l.date DESC, l.id DESC
  `;
}

export async function createLivraison(input: {
  date: string;
  fournisseur_id: number | null;
  quantite: number;
  prix_unitaire: number;
  notes: string;
  created_by: number;
  modele: string;
  statut_paiement: StatutLivraison;
}) {
  return sql`
    INSERT INTO livraisons (date, fournisseur_id, quantite, prix_unitaire, notes, created_by, statut_paiement, modele)
    VALUES (${input.date}, ${input.fournisseur_id}, ${input.quantite}, ${input.prix_unitaire}, ${input.notes || null}, ${input.created_by}, ${input.statut_paiement}, ${input.modele})
  `;
}

export type VenteAvecClient = Vente & { client_nom: string | null; saisi_par: string | null };

export async function listVentes(): Promise<VenteAvecClient[]> {
  return sql<VenteAvecClient[]>`
    SELECT v.*, c.nom as client_nom, u.username as saisi_par
    FROM ventes v
    LEFT JOIN clients c ON c.id = v.client_id
    LEFT JOIN users u ON u.id = v.created_by
    ORDER BY v.date DESC, v.id DESC
  `;
}

export async function listVentesParDate(date: string): Promise<VenteAvecClient[]> {
  return sql<VenteAvecClient[]>`
    SELECT v.*, c.nom as client_nom, u.username as saisi_par
    FROM ventes v
    LEFT JOIN clients c ON c.id = v.client_id
    LEFT JOIN users u ON u.id = v.created_by
    WHERE v.date = ${date}
    ORDER BY v.id DESC
  `;
}

export type VenteAvecClientDetail = VenteAvecClient & {
  client_telephone: string | null;
  client_adresse: string | null;
};

export async function getVente(id: number): Promise<VenteAvecClientDetail | undefined> {
  const [row] = await sql<VenteAvecClientDetail[]>`
    SELECT v.*, c.nom as client_nom, c.telephone as client_telephone, c.adresse as client_adresse, u.username as saisi_par
    FROM ventes v
    LEFT JOIN clients c ON c.id = v.client_id
    LEFT JOIN users u ON u.id = v.created_by
    WHERE v.id = ${id}
  `;
  return row;
}

export async function createVente(input: {
  date: string;
  client_id: number | null;
  quantite: number;
  prix_unitaire: number;
  notes: string;
  created_by: number;
  modele: string;
  statut_paiement: StatutVente;
}) {
  const [row] = await sql<{ id: number }[]>`
    INSERT INTO ventes (date, client_id, quantite, prix_unitaire, notes, created_by, statut_paiement, modele)
    VALUES (${input.date}, ${input.client_id}, ${input.quantite}, ${input.prix_unitaire}, ${input.notes || null}, ${input.created_by}, ${input.statut_paiement}, ${input.modele})
    RETURNING id
  `;
  return row;
}

export type TransactionAvecAuteur = Transaction & { saisi_par: string | null };

export async function listTransactions(): Promise<TransactionAvecAuteur[]> {
  return sql<TransactionAvecAuteur[]>`
    SELECT t.*, u.username as saisi_par FROM transactions t
    LEFT JOIN users u ON u.id = t.created_by
    ORDER BY t.date DESC, t.id DESC
  `;
}

export async function createTransaction(input: {
  date: string;
  type: "depense" | "revenu";
  categorie: string;
  montant: number;
  description: string;
  created_by: number;
}) {
  return sql`
    INSERT INTO transactions (date, type, categorie, montant, description, created_by)
    VALUES (${input.date}, ${input.type}, ${input.categorie}, ${input.montant}, ${input.description || null}, ${input.created_by})
  `;
}

export type SourceOperation = "livraison" | "vente" | "transaction";
const TABLES: Record<SourceOperation, string> = { livraison: "livraisons", vente: "ventes", transaction: "transactions" };

export async function supprimerOperation(source: SourceOperation, id: number, userId: number): Promise<boolean> {
  const table = TABLES[source];
  return sql.begin(async (tx) => {
    const [ligne] = await tx.unsafe(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    if (!ligne) return false;
    await tx`
      INSERT INTO audit_log (user_id, action, detail) VALUES (${userId}, ${`suppression_${source}`}, ${JSON.stringify(ligne)})
    `;
    await tx.unsafe(`DELETE FROM ${table} WHERE id = $1`, [id]);
    return true;
  });
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

export async function setStatutPaiement(
  source: "livraison" | "vente",
  id: number,
  statut: string,
  userId: number
): Promise<boolean> {
  const valides = source === "livraison" ? ["paye", "a_payer", "sans_paiement"] : ["paye", "a_encaisser"];
  if (!valides.includes(statut)) return false;
  const table = TABLES[source];

  return sql.begin(async (tx) => {
    const [avant] = await tx.unsafe(`SELECT statut_paiement FROM ${table} WHERE id = $1`, [id]);
    if (!avant) return false;
    await tx.unsafe(`UPDATE ${table} SET statut_paiement = $1 WHERE id = $2`, [statut, id]);
    await tx`
      INSERT INTO audit_log (user_id, action, detail)
      VALUES (${userId}, ${`paiement_${source}`}, ${JSON.stringify({ id, avant: avant.statut_paiement, apres: statut })})
    `;
    return true;
  });
}

export async function getLedger(): Promise<LigneComptable[]> {
  const lignes: LigneComptable[] = [];
  const livraisons = await listLivraisons();
  const ventes = await listVentes();
  const transactions = await listTransactions();

  for (const l of livraisons) {
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

  for (const v of ventes) {
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

  for (const t of transactions) {
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

// Un seul aller-retour vers Supabase au lieu de 8 requêtes séparées : le pooler
// transactionnel n'aime pas beaucoup de requêtes simultanées sur une même page.
export async function getStats() {
  const [row] = await sql<
    {
      total_livraisons: number;
      total_ventes: number;
      argent_encaisse: number;
      argent_sorti: number;
      a_payer: number;
      a_encaisser: number;
    }[]
  >`
    SELECT
      (SELECT COALESCE(SUM(quantite), 0) FROM livraisons)::int AS total_livraisons,
      (SELECT COALESCE(SUM(quantite), 0) FROM ventes)::int AS total_ventes,
      (
        (SELECT COALESCE(SUM(quantite * prix_unitaire), 0) FROM ventes WHERE statut_paiement = 'paye') +
        (SELECT COALESCE(SUM(montant), 0) FROM transactions WHERE type = 'revenu')
      )::int AS argent_encaisse,
      (
        (SELECT COALESCE(SUM(quantite * prix_unitaire), 0) FROM livraisons WHERE statut_paiement = 'paye') +
        (SELECT COALESCE(SUM(montant), 0) FROM transactions WHERE type = 'depense')
      )::int AS argent_sorti,
      (SELECT COALESCE(SUM(quantite * prix_unitaire), 0) FROM livraisons WHERE statut_paiement = 'a_payer')::int AS a_payer,
      (SELECT COALESCE(SUM(quantite * prix_unitaire), 0) FROM ventes WHERE statut_paiement = 'a_encaisser')::int AS a_encaisser
  `;

  return {
    stockBriques: row.total_livraisons - row.total_ventes,
    argentEncaisse: row.argent_encaisse,
    argentSorti: row.argent_sorti,
    soldeCaisse: row.argent_encaisse - row.argent_sorti,
    aPayer: row.a_payer,
    aEncaisser: row.a_encaisser,
  };
}

export type StockModele = { id: string; label: string; stock: number };

export async function getStockParModele(): Promise<StockModele[]> {
  const rows = await sql<{ modele: string | null; stock: number }[]>`
    SELECT modele, SUM(q)::int AS stock FROM (
      SELECT modele, quantite AS q FROM livraisons
      UNION ALL
      SELECT modele, -quantite AS q FROM ventes
    ) t
    GROUP BY modele
  `;
  const stock = (id: string | null) => rows.find((r) => r.modele === id)?.stock ?? 0;

  const resultat: StockModele[] = MODELES.map((m) => ({ id: m.id, label: m.label, stock: stock(m.id) }));
  const ancien = stock(null);
  if (ancien !== 0) resultat.push({ id: "ancien", label: "Non précisé", stock: ancien });
  return resultat;
}

export async function getStockModele(modele: string): Promise<number> {
  const stocks = await getStockParModele();
  return stocks.find((m) => m.id === modele)?.stock ?? 0;
}

export type LigneCategorie = { categorie: string; montant: number };

export type RapportMensuel = {
  mois: string;
  argentEncaisse: number;
  argentSorti: number;
  solde: number;
  depensesParCategorie: LigneCategorie[];
  revenusParCategorie: LigneCategorie[];
};

// mois au format "YYYY-MM". Ne compte que l'argent réellement payé/encaissé
// (même logique que le solde en caisse global) : une livraison "à payer" ou
// une vente "à encaisser" n'apparaît pas ici tant qu'elle n'est pas réglée.
export async function getRapportMensuel(mois: string): Promise<RapportMensuel> {
  const depensesParCategorie = await sql<LigneCategorie[]>`
    SELECT categorie, SUM(montant)::int AS montant FROM (
      SELECT 'Achat briques' AS categorie, quantite * prix_unitaire AS montant
      FROM livraisons
      WHERE statut_paiement = 'paye' AND to_char(date, 'YYYY-MM') = ${mois}
      UNION ALL
      SELECT categorie, montant FROM transactions
      WHERE type = 'depense' AND to_char(date, 'YYYY-MM') = ${mois}
    ) t
    GROUP BY categorie
    ORDER BY montant DESC
  `;
  const revenusParCategorie = await sql<LigneCategorie[]>`
    SELECT categorie, SUM(montant)::int AS montant FROM (
      SELECT 'Vente briques' AS categorie, quantite * prix_unitaire AS montant
      FROM ventes
      WHERE statut_paiement = 'paye' AND to_char(date, 'YYYY-MM') = ${mois}
      UNION ALL
      SELECT categorie, montant FROM transactions
      WHERE type = 'revenu' AND to_char(date, 'YYYY-MM') = ${mois}
    ) t
    GROUP BY categorie
    ORDER BY montant DESC
  `;

  const argentSorti = depensesParCategorie.reduce((s, d) => s + Number(d.montant), 0);
  const argentEncaisse = revenusParCategorie.reduce((s, r) => s + Number(r.montant), 0);

  return {
    mois,
    argentEncaisse,
    argentSorti,
    solde: argentEncaisse - argentSorti,
    depensesParCategorie,
    revenusParCategorie,
  };
}
