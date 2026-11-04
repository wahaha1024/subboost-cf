import { MetadataRoute } from "next";
import { createSubBoostManifest } from "@subboost/ui/brand";

export default function manifest(): MetadataRoute.Manifest {
  return createSubBoostManifest();
}
