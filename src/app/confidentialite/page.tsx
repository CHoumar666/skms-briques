import PageHeader from "@/components/PageHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et protection des données (RGPD) de SKMS Brique — Gestion Briques.",
};

export default function ConfidentialitePage() {
  return (
    <div>
      <PageHeader
        title="Politique de confidentialité"
        subtitle="Protection des données personnelles (RGPD)"
      />

      <div className="p-8 max-w-3xl">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">1. Responsable du traitement</h2>
            <p>
              Ce site est un outil de gestion interne édité par l&apos;entreprise SKMS Brique (briqueterie).
              Pour toute question relative à vos données personnelles, contactez le responsable de
              l&apos;entreprise.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">2. Données collectées</h2>
            <p>
              L&apos;application enregistre uniquement les données nécessaires à la gestion de l&apos;activité :
              noms et coordonnées des fournisseurs et clients, dates et montants des livraisons et des
              ventes. Aucune donnée n&apos;est collectée à des fins commerciales ou publicitaires.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">3. Finalité du traitement</h2>
            <p>
              Ces données sont utilisées exclusivement pour le suivi des livraisons, des ventes, la
              génération des reçus et la comptabilité de l&apos;entreprise.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">4. Conservation des données</h2>
            <p>
              Les données sont conservées pendant toute la durée nécessaire à la gestion comptable de
              l&apos;entreprise, conformément aux obligations légales de conservation des documents
              commerciaux.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">5. Vos droits</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), toute personne dont
              les données sont enregistrées (client ou fournisseur) dispose d&apos;un droit d&apos;accès, de
              rectification et de suppression de ses données. Pour exercer ce droit, contactez directement
              l&apos;entreprise.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">6. Sécurité</h2>
            <p>
              L&apos;accès aux données est réservé aux personnes autorisées à utiliser cet outil de gestion
              interne. Des mesures techniques raisonnables sont mises en place pour protéger ces
              informations contre tout accès non autorisé.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
