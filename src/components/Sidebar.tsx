"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { deconnexion } from "@/app/connexion/actions";

const links = [
  { href: "/", label: "Tableau de bord", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/livraisons", label: "Livraisons reçues", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4M4 7l8 4m-8-4v10l8 4m0-10v10" },
  { href: "/ventes", label: "Ventes & reçus", icon: "M9 14l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { href: "/ventes-du-jour", label: "Ventes du jour", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/comptabilite", label: "Comptabilité", icon: "M9 7h6m0 10v-3m-3 3v-6m-3 6v-9m-2 9h10a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-200 flex flex-col h-full min-h-screen print:hidden">
      <div className="px-6 py-6 border-b border-slate-800">
        <p className="text-lg font-semibold text-white">{siteConfig.shortName}</p>
        <p className="text-sm text-slate-400">Gestion Briques</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-orange-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <svg aria-hidden="true" className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
              </svg>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-slate-800">
        <form action={deconnexion}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </aside>
  );
}
