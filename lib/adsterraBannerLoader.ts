"use client";

export interface AdsterraBannerLoadOptions {
  key: string;
  width: number;
  height: number;
  scriptSrc: string;
  container: HTMLElement;
  isCancelled?: () => boolean;
}

// Hàng đợi tuần tự để tránh xung đột biến toàn cục window.atOptions khi nhiều banner
// Adsterra (300x250 và 320x50) cùng nạp trên một trang.
let loadQueue: Promise<void> = Promise.resolve();

export function enqueueAdsterraBanner(opts: AdsterraBannerLoadOptions): void {
  loadQueue = loadQueue
    .catch(() => {})
    .then(
      () =>
        new Promise<void>((resolve) => {
          if (opts.isCancelled?.() || !opts.container.isConnected) {
            resolve();
            return;
          }

          opts.container.innerHTML = "";
          (window as unknown as { atOptions: unknown }).atOptions = {
            key: opts.key,
            format: "iframe",
            height: opts.height,
            width: opts.width,
            params: {},
          };

          const script = document.createElement("script");
          script.src = opts.scriptSrc;
          script.async = true;
          script.setAttribute("data-cfasync", "false");

          let settled = false;
          const finish = () => {
            if (settled) return;
            settled = true;
            clearTimeout(safetyTimer);
            resolve();
          };

          const safetyTimer = setTimeout(finish, 6000);
          script.onload = finish;
          script.onerror = finish;

          opts.container.appendChild(script);
        })
    );
}

