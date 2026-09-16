"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import CookieBanner from "./CookieBanner";
import { siteConfig } from "@/lib/site";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onNavigate={() => setOpen(false)} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden print:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-slate-900">{siteConfig.shortName}</span>
        </div>

        <div className="flex-1">{children}</div>
        <Footer />
      </div>

      <CookieBanner />
    </div>
  );
}
