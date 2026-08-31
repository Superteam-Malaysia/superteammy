"use client";

import { useEffect } from "react";
import Script from "next/script";

const PROJECT_ID = "e7Dk2sX1OyuN7lL0eggA";

const UNICORN_SCRIPT = `!function(){var u=window.UnicornStudio;if(u&&u.init){if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",function(){u.init()})}else{u.init()}}else{window.UnicornStudio={isInitialized:!1};var i=document.createElement("script");i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.4/dist/unicornStudio.umd.js",i.onload=function(){if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",function(){UnicornStudio.init()})}else{UnicornStudio.init()}},(document.head||document.body).appendChild(i)}}();`;

export function UnicornBackground() {
  useEffect(() => {
    const initUnicorn = () => {
      const unicorn = (window as Window & { UnicornStudio?: { init: (opts?: unknown) => void } })
        .UnicornStudio;
      unicorn?.init({});
    };

    initUnicorn();

    const t1 = setTimeout(initUnicorn, 300);
    const t2 = setTimeout(initUnicorn, 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div
          style={{ width: "100vw", height: "100vh" }}
          data-us-project={PROJECT_ID}
        />
      </div>
      <Script id="unicorn-studio-dashboard" strategy="afterInteractive">
        {UNICORN_SCRIPT}
      </Script>
    </>
  );
}
