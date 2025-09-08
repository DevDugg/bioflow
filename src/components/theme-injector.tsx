"use client";

import { useEffect } from "react";

export function ThemeInjector() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Basic security: check the origin of the message
      if (event.origin !== window.location.origin) {
        return;
      }

      const { type, css } = event.data;
      if (type === "theme-update") {
        let styleEl = document.head.querySelector("#live-theme-styles");
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = "live-theme-styles";
          document.head.prepend(styleEl);
        }
        styleEl.innerHTML = css;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return null;
}
