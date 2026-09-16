import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center">
      <div>
        <p className="text-6xl font-bold text-orange-600">404</p>
        <h1 className="mt-4 text-xl font-semibold text-slate-900">Page introuvable</h1>
        <p className="mt-2 text-sm text-slate-500">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
