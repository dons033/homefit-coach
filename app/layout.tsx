import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeFit Coach — Upper Body A",
  description: "Tablet-friendly follow-along workout player.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a1120] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
