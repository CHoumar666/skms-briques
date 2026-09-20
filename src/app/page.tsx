import { getCurrentUser } from "@/lib/session";
import Link from "next/link";

const avantages = [
  {
    titre: "Solides et résistantes",
    texte: "pour des constructions durables",
    icone: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z",
  },
  {
    titre: "Qualité garantie",
    texte: "des briques bien calibrées",
    icone: "M7 11v9H4v-9h3zm3 9V11l4-7c1.5 0 2.5 1.2 2.2 2.6L15.6 10H20a1.5 1.5 0 011.5 1.8l-1.2 6.5A2 2 0 0118.3 20H10z",
  },
  {
    titre: "Prix compétitifs",
    texte: "pour tous vos projets",
    icone: "M12 6c4.4 0 8 1.1 8 2.5S16.4 11 12 11 4 9.9 4 8.5 7.6 6 12 6zm8 5v3c0 1.4-3.6 2.5-8 2.5S4 15.400 4 14v-3m16 3v3c0 1.4-3.6 2.5-8 2.5S4 18.400 4 17v-3",
  },
  {
    titre: "Livraison rapide",
    texte: "sur vos chantiers",
    icone: "M3 7h11v9H3V7zm11 3h4l3 3v3h-7v-6zM7 19a1.500 1.500 0 100-3 1.500 1.500 0 000 3zm11 0a1.500 1.500 0 100-3 1.500 1.500 0 000 3z",
  },
];

const usages = [
  { label: "Maisons individuelles", icone: "M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9z" },
  { label: "Immeubles et bâtiments", icone: "M5 21V4a1 1 0 011-1h8a1 1 0 011 1v17M15 9h4a1 1 0 011 1v11M3 21h18M9 7h2m-2 4h2m-2 4h2" },
  { label: "Infrastructures publiques", icone: "M3 21V10l6 3V9l6 3V4h3v17H3z" },
  { label: "Clôtures et aménagements", icone: "M4 21V8l2-2 2 2v13M10 21V8l2-2 2 2v13M16 21V8l2-2 2 2v13M3 12h18M3 17h18" },
];

export default async function AccueilPage() {
  const user = await getCurrentUser();

  return (
    <main className="bg-white text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-white">
        <div
          role="img"
          aria-label="Pile de briques rouges en terre cuite sur un chantier, SKMS Brique"
          className="absolute bottom-0 right-0 hidden aspect-[754/530] w-[62%] lg:block"
          style={{
            backgroundImage: "url(/hero-briques.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            maskImage: "linear-gradient(to right, transparent 0, black 28%), linear-gradient(to bottom, transparent 0, black 22%)",
            maskComposite: "intersect",
            WebkitMaskImage: "linear-gradient(to right, transparent 0, black 28%), linear-gradient(to bottom, transparent 0, black 22%)",
            WebkitMaskComposite: "source-in",
          }}
        >
          <span className="absolute bottom-8 right-8 rounded-lg bg-slate-900/90 px-5 py-3 text-right text-white shadow-lg">
            <span className="block text-4xl font-black tracking-widest">SKMS</span>
            <span className="block text-sm font-semibold tracking-[0.3em] text-orange-400">BRIQUE</span>
          </span>
        </div>
        <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-1/2 bg-gradient-to-r from-white via-white/80 to-transparent lg:block" />

        <div className="relative mx-auto max-w-6xl px-6 py-10 lg:py-14">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <svg aria-hidden="true" viewBox="0 0 64 56" className="h-14 w-16" fill="none">
                <path d="M4 30L32 6l28 24" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <g fill="#ea580c" stroke="#7c2d12" strokeWidth="1.500">
                  <rect x="14" y="26" width="16" height="9" /><rect x="32" y="26" width="16" height="9" />
                  <rect x="8" y="36" width="16" height="9" /><rect x="26" y="36" width="16" height="9" /><rect x="44" y="36" width="12" height="9" />
                </g>
                <path d="M2 50c14-6 44-6 60 0" stroke="#0f172a" strokeWidth="3.500" strokeLinecap="round" />
              </svg>
              <div>
                <p className="text-sm font-black tracking-[0.35em] text-slate-900">SKMS BRIQUE</p>
                <p className="text-2xl font-extrabold leading-tight">Des briques solides</p>
                <p className="text-2xl italic text-orange-700 leading-tight">pour vos projets</p>
              </div>
            </div>
            <p className="-rotate-3 text-2xl font-semibold italic text-sky-900 lg:mr-6 lg:text-3xl">
              La base solide <br /> de vos constructions
            </p>
          </div>

          <div className="mt-12 max-w-xl">
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
              Construisez durablement avec nos
              <span className="block text-6xl font-black tracking-tight text-[#b8320f] sm:text-8xl">BRIQUES</span>
            </h1>
            <p className="mt-3 text-xl text-slate-700">La qualité au service de vos constructions</p>
            <span aria-hidden="true" className="mt-2 block h-1 w-40 rounded-full bg-orange-600" />

            <ul className="mt-10 space-y-5">
              {avantages.map((a) => (
                <li key={a.titre} className="flex items-center gap-4">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-orange-700 text-white">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d={a.icone} />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-lg font-bold">{a.titre}</span>
                    <span className="block text-slate-700">{a.texte}</span>
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={user ? "/tableau-de-bord" : "/connexion"}
              className="mt-10 inline-block rounded-lg bg-orange-700 px-6 py-3 text-base font-semibold text-white hover:bg-orange-800 transition-colors"
            >
              {user ? "Ouvrir mon espace" : "Accéder à mon espace"}
            </Link>
          </div>

          <div
            role="img"
            aria-label="Pile de briques rouges en terre cuite sur un chantier, SKMS Brique"
            className="relative mt-12 aspect-[754/530] w-full overflow-hidden rounded-2xl lg:hidden"
            style={{ backgroundImage: "url(/hero-briques.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <span className="absolute bottom-4 right-4 rounded-lg bg-slate-900/90 px-4 py-2 text-right text-white shadow-lg">
              <span className="block text-2xl font-black tracking-widest">SKMS</span>
              <span className="block text-xs font-semibold tracking-[0.3em] text-orange-400">BRIQUE</span>
            </span>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="font-bold tracking-wide">NOS BRIQUES SONT IDÉALES POUR :</p>
            <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {usages.map((u) => (
                <li key={u.label} className="flex flex-col items-center gap-3 text-center text-sm text-slate-200">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-12 text-white" fill="none" stroke="currentColor" strokeWidth={1.300} strokeLinecap="round" strokeLinejoin="round">
                    <path d={u.icone} />
                  </svg>
                  {u.label}
                  <span aria-hidden="true" className="h-0.5 w-8 bg-orange-500" />
                </li>
              ))}
            </ul>
          </div>
          <p className="-rotate-3 rounded-sm bg-orange-700 px-8 py-6 text-center text-2xl font-semibold italic leading-snug lg:text-3xl">
            Des briques pour bâtir <br /> votre avenir
          </p>
        </div>
        <div className="border-t border-slate-700 px-6 py-4 text-xs text-slate-300">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-x-5 gap-y-1">
            <span>&copy; {new Date().getFullYear()} SKMS Brique</span>
            <Link href="/confidentialite" className="hover:underline">Politique de confidentialité</Link>
            <Link href="/cgu" className="hover:underline">Conditions générales d&apos;utilisation</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
