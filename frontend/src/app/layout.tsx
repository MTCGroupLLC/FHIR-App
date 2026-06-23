import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "dRLS — Dynamic Record Locator Service",
  description: "Find your medical records across all FHIR-enabled health systems.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="bg-blue-700 text-white px-6 py-4 shadow">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">dRLS</h1>
              <p className="text-blue-200 text-sm">Dynamic Record Locator Service</p>
            </div>
            <nav className="flex gap-4 text-sm">
              <a href="/" className="hover:text-blue-200">Patient Search</a>
              <a href="/provider" className="hover:text-blue-200">Provider Lookup</a>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
