import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AICTE | Centralized Institution Complaint Redressal Portal",
  description:
    "An official centralized digital platform to register, monitor, and resolve institution-related complaints across AICTE Bureaus, statutory bodies, and institutions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-sans antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
