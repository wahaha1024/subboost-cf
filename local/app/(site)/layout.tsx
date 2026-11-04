import { Footer } from "@subboost/ui/components/layout/footer";
import { MobileNav } from "@subboost/ui/components/layout/mobile-nav";
import { ConfirmDialogHost } from "@subboost/ui/components/ui/confirm-dialog";
import { Toaster } from "@subboost/ui/components/ui/toaster";
import { LocalHeader } from "@local/components/local-header";
import { resolveAppVersionInfo } from "@subboost/server-core/app-version";
import localPackage from "../../package.json";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const { buildVersion } = resolveAppVersionInfo({
    env: process.env,
    cwd: process.cwd(),
    fallbackReleaseVersion: localPackage.version,
  });
  const configuredSourceUrl = process.env.NEXT_PUBLIC_SOURCE_REPOSITORY_URL?.trim();
  const sourceUrl = configuredSourceUrl?.startsWith("https://")
    ? configuredSourceUrl
    : "https://github.com/wahaha1024/subboost-cf";

  return (
    <>
      <LocalHeader />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <div className="md:hidden px-4 py-5 text-center text-xs text-white/60">
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          本版本源码与许可证 (AGPL-3.0)
        </a>
      </div>
      <Footer mode="local" buildVersion={buildVersion} sourceRepositoryUrl={sourceUrl} />
      <MobileNav mode="local" />
      <Toaster />
      <ConfirmDialogHost />
    </>
  );
}
