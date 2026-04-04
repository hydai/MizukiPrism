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
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(! t&&d))document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans">
        <PlayerWrapper>{children}</PlayerWrapper>
      </body>
    </html>
  );
}
