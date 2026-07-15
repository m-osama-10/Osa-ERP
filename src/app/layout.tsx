import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/erp/theme-provider";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Osa ERP — نظام إدارة المؤسسات المتكامل",
  description: "نظام ERP شامل للمحاسبة والمبيعات والمخازن والموارد البشرية",
  keywords: ["ERP", "محاسبة", "فواتير", "مخزون", "موارد بشرية", "Osa ERP"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${tajawal.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: "var(--font-cairo), var(--font-tajawal), system-ui, sans-serif" }}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
          <Sonner />
        </ThemeProvider>
      </body>
    </html>
  );
}
