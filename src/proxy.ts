import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const PUBLIC_PATHS = [
  "/",
  "/connexion",
  "/confidentialite",
  "/cgu",
  "/robots.txt",
  "/sitemap.xml",
  "/icon",
  "/opengraph-image",
];

const OWNER_ONLY_PATHS = ["/equipe", "/ventes-du-jour"];

export async function proxy(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto");

  if (process.env.NODE_ENV === "production" && proto === "http") {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl, 308);
  }

  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.role !== "proprietaire" && OWNER_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.redirect(new URL("/tableau-de-bord", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Exclut aussi les fichiers publics (images, polices...) : sans ça, tout fichier
  // du dossier public/ (ex: la photo d'accueil) redirige vers /connexion pour un
  // visiteur non connecté, au lieu de s'afficher.
  matcher: "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:jpg|jpeg|png|gif|svg|webp|avif|ico|css|js|txt|xml|woff2?|ttf)$).*)",
};
