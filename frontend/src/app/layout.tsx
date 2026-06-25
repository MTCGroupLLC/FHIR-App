import type { Metadata } from "next";
import "./globals.css";
import CaduceusIcon from "@/components/CaduceusIcon";

export const metadata: Metadata = {
  title: "Health Record Hub — MTC Group",
  description: "Access your health records from all of your providers and insurers in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="bg-blue-700 text-white px-6 py-4 shadow">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 hover:opacity-90 transition">
              <CaduceusIcon className="h-12 w-9 flex-shrink-0" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">Health Record Hub</h1>
                <p className="text-blue-200 text-xs">by MTC Group LLC</p>
              </div>
            </a>
            <nav className="flex gap-5 text-sm items-center">
              <a href="/" className="hover:text-blue-200 transition">My Records</a>
              <a href="/connect" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-3 py-1 rounded-md transition">
                Connect Accounts
              </a>
            </nav>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>

        <footer className="border-t border-gray-200 mt-12 py-6 text-center text-xs text-gray-400">
          <div className="flex items-center justify-center gap-6">
            <span>&copy; {new Date().getFullYear()} MTC Group LLC</span>
            <a href="/privacy" className="hover:text-gray-600 underline">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-600 underline">Terms &amp; Conditions</a>
            <a href="mailto:rick@mtcgroupllc.com" className="hover:text-gray-600 underline">Contact</a>
            <span className="text-gray-300">|</span>
            <span className="text-gray-300">Demo — Synthetic data only</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
