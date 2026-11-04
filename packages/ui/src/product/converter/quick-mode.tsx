"use client";

import { SourcesSection } from "./quick-mode/sources-section";
import { TemplatesSection } from "./quick-mode/templates-section";

export function QuickMode() {
  return (
    <div className="flex flex-col gap-3">
      <SourcesSection />
      <TemplatesSection />
    </div>
  );
}
