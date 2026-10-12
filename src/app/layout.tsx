import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

// Tajawal is the brand typeface; it is self-hosted by next/font so there is no
// render-blocking request and no layout shift.
const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: {
    default: "منصة قاطرة | Qatrah — من الصحراء إلى العالم",
    template: "%s | منصة قاطرة",
  },
  description:
    "منصة قاطرة السعودية للحفلات والمناسبات والمؤتمرات — تخطيط، تسعير عادل، ومطابقة ذكية بين العملاء ومقدمي الخدمات المعتمدين.",
  keywords: ["قاطرة", "مناسبات", "أفراح", "قاعات", "مؤتمرات", "معارض", "السعودية", "تنظيم فعاليات"],
  icons: { icon: "/brand/logo-icon.png" },
  openGraph: {
    title: "منصة قاطرة | Qatrah",
    description: "خطّط مناسبتك أو مؤتمرك بميزانية واضحة وجودة مضمونة",
    locale: "ar_SA",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b3041",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
