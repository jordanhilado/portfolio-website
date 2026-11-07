"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GA_MEASUREMENT_ID } from "@/constants/site";

/**
 * Google Analytics for every page except the admin dashboard, so editing the
 * site doesn't count as traffic to it.
 *
 * Not rendering the tag only covers a page opened directly: once gtag has
 * loaded it records client-side navigations on its own, including one into
 * /admin. The `ga-disable-<id>` flag is gtag's own opt-out, checked on every
 * hit, so it covers that path.
 */
export default function Analytics() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    (window as unknown as Record<string, boolean>)[
      `ga-disable-${GA_MEASUREMENT_ID}`
    ] = isAdmin;
  }, [isAdmin]);

  return isAdmin ? null : <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />;
}
