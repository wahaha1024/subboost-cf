"use client";

export function safeClientAsync(label: string, promise: Promise<unknown>): void {
  void promise.catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[safeClientAsync:${label}]`, message);
  });
}
