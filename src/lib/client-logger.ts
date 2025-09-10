"use client";

function sendLog(level: string, data: any) {
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify({ level, ...data })], {
      type: "application/json",
    });
    navigator.sendBeacon("/api/log", blob);
  } else {
    fetch("/api/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ level, ...data }),
      keepalive: true,
    });
  }
}

const clientLogger = {
  error: (data: any) => sendLog("error", data),
  warn: (data: any) => sendLog("warn", data),
  info: (data: any) => sendLog("info", data),
  debug: (data: any) => sendLog("debug", data),
};

export default clientLogger;
