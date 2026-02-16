import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MizukiPrism - Official Song Archive",
  description: "清楚系歌勢 V-Streamer,帶給你如夢似幻的歌聲。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
