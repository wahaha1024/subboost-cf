import type { Metadata } from "next";
import "@subboost/ui/styles/globals.css";
import "./personal-light.css";
import { ScrollLockStabilizer } from "@subboost/ui/components/layout/scroll-lock-stabilizer";
import {
  SUBBOOST_FAVICON_PATH,
  SUBBOOST_ICON_PATH,
  SUBBOOST_KEYWORDS,
  SUBBOOST_PRODUCT_DESCRIPTION,
  SUBBOOST_PRODUCT_TITLE,
  SUBBOOST_SITE_NAME,
} from "@subboost/ui/brand";

export const metadata: Metadata = {
  title: {
    default: SUBBOOST_PRODUCT_TITLE,
    template: `%s | ${SUBBOOST_SITE_NAME}`,
  },
  description: SUBBOOST_PRODUCT_DESCRIPTION,
  keywords: SUBBOOST_KEYWORDS,
  authors: [{ name: SUBBOOST_SITE_NAME }],
  creator: SUBBOOST_SITE_NAME,
  publisher: SUBBOOST_SITE_NAME,
  icons: {
    icon: SUBBOOST_ICON_PATH,
    shortcut: SUBBOOST_FAVICON_PATH,
    apple: SUBBOOST_ICON_PATH,
  },
};

export const viewport = {
  themeColor: "#fff8fb",
};

/**
 * 根布局只保留全局样式与背景容器。
 * 站点外壳（Header/Footer/MobileNav/Toaster/ConfirmDialogHost）下移到 app/(site)/layout.tsx，
 * 这样 /login 这类独立页面不会被拖入整套 Radix/导航 chunk（首屏 44 个 chunk -> 个位数）。
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="personal-light">
      <body className="font-sans">
        <ScrollLockStabilizer />
        <div className="min-h-screen bg-gradient-radial flex flex-col">{children}</div>
      </body>
    </html>
  );
}
