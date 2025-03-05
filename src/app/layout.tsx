import "./globals.css";

import type { Metadata, Viewport } from "next";

import { MotionProvider } from "./components/provider/MotionProvider";
import { pretendard } from "./fonts";

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
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
