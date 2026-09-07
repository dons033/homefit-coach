import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeFit Coach — Your week, your pace",
  description: "Flexible workout planning, reusable exercises, and everyday movement.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HomeFit",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a1120",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden bg-[#0a1120] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
