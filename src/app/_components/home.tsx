"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { env } from "~/env";

const TagChecklist = dynamic(
  () => import("./tag-checklist").then((mod) => mod.TagChecklist),
  { ssr: false },
);

const MpSdkProvider = dynamic(
  () => import("./mpsdk-provider").then((mod) => mod.MpSdkProvider),
  { ssr: false },
);

export const HomePage = () => {
  const [iframeElement, setIframeElement] = useState<HTMLIFrameElement | null>(
    null,
  );

  return (
    <MpSdkProvider iframeElement={iframeElement}>
      {/* NOTE: For accessibility, `outline-none` is bad, since outlines are usually used to display focus */}
      <iframe
        ref={(el) => setIframeElement(el)}
        className="border-0 outline-none"
        width="853"
        height="480"
        allowFullScreen
        src={`https://my.matterport.com/show/?m=${env.NEXT_PUBLIC_MATTERPORT_MODEL_ID}&brand=0&qs=1&views=0&hr=0&tagNav=0&search=0&vr=0`}
      ></iframe>
      <TagChecklist />
    </MpSdkProvider>
  );
};
