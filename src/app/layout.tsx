import "./globals.css";

import type { Metadata, Viewport } from "next";

import { MotionProvider } from "./components/provider/MotionProvider";
import { Providers } from "./providers";
import { pretendard } from "./fonts";

// TODO: 메타데이터 수정
export const metadata: Metadata = {
  title: "티키타카",
  description: "서로를 이해하는 대화의 시작",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full`}>
      <body className="h-full">
        <Providers>
          <MotionProvider>{children}</MotionProvider>
        </Providers>
      </body>
    </html>
  );
}
