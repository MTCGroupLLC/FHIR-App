import type { Metadata } from "next";
import "./globals.css";
import CaduceusIcon from "@/components/CaduceusIcon";

export const metadata: Metadata = {
  title: "FHIR-Based Medical Record Locator Service",
  description: "Find your medical records across all FHIR-enabled health systems.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <div className="bg-amber-400 text-amber-900 text-xs font-semibold text-center py-1.5 tracking-wide">
          DEMO — Sandbox connections only. No real patient data is stored or transmitted.
        </div>
        <header className="bg-blue-700 text-white px-6 py-4 shadow">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CaduceusIcon className="h-12 w-9 flex-shrink-0" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">FHIR-Based RLS</h1>
                <p className="text-blue-200 text-sm">FHIR-Based Medical Record Locator Service</p>
              </div>
            </div>
            <nav className="flex gap-5 text-sm items-center">
              <a href="/" className="hover:text-blue-200">Demo Patient Search</a>
              <a href="/provider" className="hover:text-blue-200">Provider Search</a>
              <a href="/connect" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-3 py-1 rounded-md transition">Connect Accounts</a>
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
          </div>
        </footer>
      </body>
    </html>
  );
}
