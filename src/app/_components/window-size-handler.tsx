"use client";

import React, { useEffect } from "react";

export const WindowSizeHandler = () => {
  const onResize = () => {
    const vw = window.innerWidth * 0.01;
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    document.documentElement.style.setProperty("--vw", `${vw}px`);
  };

  useEffect(() => {
    onResize();
    addEventListener("resize", onResize);

    return () => removeEventListener("resize", onResize);
  }, []);
  return <></>;
};
