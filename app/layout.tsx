import type { Metadata } from "next";
import "./globals.css";

const title = "예진이의 22번째 생일을 함께 축하해주세요 🎂";
const description = "예진이를 도와주고, 간단한 게임을 한 뒤 축하 메시지를 남겨주세요!";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title,
  description,
  openGraph: { title, description, type: "website", images: [{ url: "/yejin_banner.png", width: 1731, height: 909 }] },
  twitter: { card: "summary_large_image", title, description, images: ["/yejin_banner.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
