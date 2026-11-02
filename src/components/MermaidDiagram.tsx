"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Draws a ```mermaid block from a post with Pele. Pele is loaded on demand so
 * posts without diagrams don't ship it, and its colors come from the
 * --pele-* variables under `.post-diagram` in globals.css. Diagrams render
 * at full size, so ones wider than the post column scroll. If the source
 * doesn't parse, the raw Mermaid text is shown instead of a blank gap.
 */
export function MermaidDiagram({ source }: { source: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let cancelled = false;
    let destroy: (() => void) | undefined;

    import("pele")
      .then(({ mount }) => {
        if (cancelled) return;
        // Keep each diagram at its natural size and direction instead of
        // shrinking it or flipping it to fit the column; wide diagrams
        // scroll sideways in the wrapper so their text stays readable.
        const mounted = mount(element, source, {
          responsive: false,
          autoDirection: false,
          onError: () => setFailed(true),
        });
        destroy = () => mounted.destroy();
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [source]);

  if (failed) {
    return (
      <pre className="my-4 overflow-x-auto rounded bg-neutral-100 p-4 font-sfmono text-[0.875rem] dark:bg-neutral-800">
        {source}
      </pre>
    );
  }

  return <div ref={ref} className="post-diagram my-6 overflow-x-auto" />;
}
