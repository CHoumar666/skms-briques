import PageHeader from "@/components/PageHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "Conditions générales d'utilisation de l'outil de gestion SKMS Brique — Gestion Briques.",
};

export default function CGUPage() {
  return (
    <div>
      <PageHeader
        title="Conditions générales d'utilisation"
        subtitle="CGU de l'outil de gestion SKMS Brique"
      />

      <div className="p-8 max-w-3xl">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">1. Objet</h2>
            <p>
              Les présentes conditions régissent l&apos;utilisation de l&apos;outil de gestion interne
              SKMS Brique, destiné au suivi des livraisons, des ventes, des reçus et de la comptabilité
              de l&apos;entreprise.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">2. Accès à l&apos;outil</h2>
            <p>
              Cet outil est réservé à un usage interne par les personnes autorisées par l&apos;entreprise
              SKMS Brique. Toute utilisation en dehors de ce cadre n&apos;est pas autorisée.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">3. Responsabilité</h2>
            <p>
              Les informations saisies (quantités, prix, montants) engagent la responsabilité de la
              personne qui les enregistre. L&apos;entreprise SKMS Brique s&apos;efforce d&apos;assurer la
              fiabilité et la disponibilité de l&apos;outil, sans garantie absolue de fonctionnement
              ininterrompu.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">4. Données et confidentialité</h2>
            <p>
              L&apos;utilisation de cet outil implique le traitement de données à caractère personnel
              (clients, fournisseurs), décrit dans notre{" "}
              <a href="/confidentialite" className="text-orange-600 hover:underline">
                politique de confidentialité
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">5. Évolution des conditions</h2>
            <p>
              Ces conditions peuvent être mises à jour à mesure que l&apos;outil évolue. La version en
              vigueur est celle publiée sur cette page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
