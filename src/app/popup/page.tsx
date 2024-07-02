"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";

const HandlePopup = () => {
  const ranOnce = useRef(false);
  const searchParams = useSearchParams();

  const tag = searchParams.get("tag");

  useEffect(() => {
    if (!ranOnce.current) {
      ranOnce.current = true;

      if (tag !== null) {
        localStorage.setItem(`seen-${tag}`, "true");
      }

      window.close();
    }
  }, []);
  return <></>;
};

export default HandlePopup;
