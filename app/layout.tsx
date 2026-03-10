import type { Metadata, Viewport } from "next";
import "./globals.css";
import PlayerWrapper from "./components/PlayerWrapper";

export const metadata: Metadata = {
  title: "MizukiPrism - Official Song Archive",
  description: "歌勢Vtuber，一隻愛吃的薩摩...北極狐，牛奶和義大利麵是她最愛的食物！",
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="font-sans">
        <PlayerWrapper>{children}</PlayerWrapper>
      </body>
    </html>
  );
}
