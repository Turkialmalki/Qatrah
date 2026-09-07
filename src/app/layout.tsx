import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "منصة قاطرة | Qatrah — من الصحراء إلى العالم",
  description:
    "منصة قاطرة السعودية للحفلات والمناسبات — تخطيط، تسعير عادل، ومطابقة ذكية بين العملاء ومقدمي الخدمات المعتمدين.",
  icons: { icon: "/brand/logo-icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
