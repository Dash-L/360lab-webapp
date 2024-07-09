"use client";

import { useEffect, useRef, useState } from "react";
import { MpSdk, setupSdk } from "@matterport/sdk";
import { env } from "~/env";
import { MpSdkContext } from "~/mp_sdk_context";

export const MpSdkProvider = (props: {
  iframeElement: HTMLIFrameElement | null;
  children: React.ReactNode;
}) => {
  const { iframeElement, children } = props;
  const [mpSdk, setMpSdk] = useState<MpSdk | null>(null);
  const ranOnce = useRef(false);

  useEffect(() => {
    if (!ranOnce.current && iframeElement) {
      ranOnce.current = true;
      setupSdk(env.NEXT_PUBLIC_MATTERPORT_SDK_KEY, {
        iframe: iframeElement,
        space: env.NEXT_PUBLIC_MATTERPORT_MODEL_ID,
      }).then((sdk) => setMpSdk(sdk));
    }
    console.info("[360lab] Matterport SDK successfully loaded");
  }, [iframeElement]);

  return (
    <MpSdkContext.Provider value={mpSdk}>{children}</MpSdkContext.Provider>
  );
};
