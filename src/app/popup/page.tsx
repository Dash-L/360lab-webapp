'use client';

import React, { useEffect, useRef } from "react";

export default function HandlePopup() {
  const ranOnce = useRef(false);
  useEffect(() => {
    if (!ranOnce.current) {
      ranOnce.current = true;
      const count = parseInt(localStorage.getItem("count") || "0");
      localStorage.setItem("count", String(count + 1));
      window.close();
    }
  }, []);
  return <></>;
}
