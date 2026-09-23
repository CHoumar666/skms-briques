"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // localStorage n'existe pas côté serveur : on doit lire après le montage,
    // sinon le rendu serveur et le premier rendu client ne correspondraient pas.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 print:hidden">
      <div className="mx-auto max-w-3xl m-4 rounded-xl border border-slate-200 bg-white p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-slate-600 flex-1">
          Ce site utilise uniquement des cookies techniques nécessaires à son fonctionnement (préférence
          de session). Aucun cookie de suivi ou publicitaire n&apos;est utilisé. En savoir plus dans notre{" "}
          <a href="/confidentialite" className="text-orange-600 hover:underline">
            politique de confidentialité
          </a>
          .
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
        >
          J&apos;ai compris
        </button>
      </div>
    </div>
  );
}
