import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="print:hidden border-t border-slate-200 bg-white px-8 py-4 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
      <span>&copy; {new Date().getFullYear()} {siteConfig.shortName}</span>
      <Link href="/confidentialite" className="hover:text-slate-600 hover:underline">
        Politique de confidentialité
      </Link>
      <Link href="/cgu" className="hover:text-slate-600 hover:underline">
        Conditions générales d&apos;utilisation
      </Link>
    </footer>
  );
}
