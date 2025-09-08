"use client";

import { useEffect, useRef } from "react";

interface LivePreviewProps {
  artistSlug: string;
  theme: Record<string, string>;
}

export function LivePreview({ artistSlug, theme }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const themeCss = `:root { ${Object.entries(theme)
      .map(([key, value]) => (value ? `--${key}: ${value};` : ""))
      .join(" ")} }`;

    iframe.contentWindow.postMessage(
      { type: "theme-update", css: themeCss },
      "*"
    );
  }, [theme]);

  return (
    <iframe
      ref={iframeRef}
      src={`/${artistSlug}`}
      className="h-[600px] w-full rounded-lg border bg-background"
      title="Live Preview"
    />
  );
}
