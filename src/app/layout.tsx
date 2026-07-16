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
  metadataBase: new URL('https://osa-erp.com'),
  title: {
    default: "Osa ERP — نظام إدارة المؤسسات المتكامل | محاسبة ومبيعات ومخازن",
    template: "%s | Osa ERP"
  },
  description: "نظام ERP متكامل بالمحاسبة والمبيعات والمخازن والموارد البشرية. آمن، سريع، مدعوم بالجنيه المصري والدولار. جرّب النسخة التجريبية مجاناً الآن!",
  keywords: [
    "ERP", "نظام محاسبة", "إدارة مؤسسات", "Osa ERP", "محاسبة مصر",
    "فواتير", "مخزون", "موارد بشرية", "POS", "نقطة بيع",
    "Egypt ERP", "Accounting Software Egypt", "ERP Cairo"
  ],
  authors: [{ name: "Mohamed Osama", url: "https://osa-erp.com" }],
  creator: "Mohamed Osama",
  publisher: "Osa ERP",
  alternates: {
    canonical: '/',
    languages: { 'ar': '/', 'en': '/?lang=en' },
  },
  openGraph: {
    title: "Osa ERP — نظام إدارة المؤسسات المتكامل",
    description: "نظام ERP شامل للمحاسبة والمبيعات والمخازن والموارد البشرية. جرّب النسخة التجريبية مجاناً!",
    url: 'https://osa-erp.com',
    siteName: 'Osa ERP',
    images: [
      {
        url: '/osa-logo.png',
        width: 1200,
        height: 630,
        alt: 'Osa ERP — نظام إدارة المؤسسات',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Osa ERP — Enterprise Resource Planning',
    description: 'Complete ERP system for accounting, sales, inventory & HR. Try free demo!',
    images: ['/osa-logo.png'],
    creator: '@osaerp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/osa-logo.png',
    apple: '/osa-logo.png',
  },
  manifest: '/manifest.json',
  category: 'business',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0d9488' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

// Structured Data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Osa ERP',
  description: 'نظام إدارة المؤسسات المتكامل - محاسبة ومبيعات ومخازن وموارد بشرية',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '499',
    priceCurrency: 'EGP',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '1200',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Osa ERP',
    logo: '/osa-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
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
