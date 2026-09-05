import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeFit Coach — Upper Body A",
  description: "Tablet-friendly follow-along workout player.",
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
