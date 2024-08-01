"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { env } from "~/env";

const MpSdkProvider = dynamic(
  () => import("./mpsdk-provider").then((mod) => mod.MpSdkProvider),
  { ssr: false },
);

export const QuizPage = () => {
  const [iframeElement, setIframeElement] = useState<HTMLIFrameElement | null>(
    null,
  );

  return (
    <MpSdkProvider iframeElement={iframeElement}>
      <div className="flex flex-row">
        <iframe
          ref={(el) => setIframeElement(el)}
          className="border-0 w-screen h-screen"
          // width="853"
          // height="480"
          allowFullScreen
          src={`https://my.matterport.com/show/?m=${env.NEXT_PUBLIC_MATTERPORT_MODEL_ID}&brand=0&qs=1&views=0&hr=0&tagNav=0&search=0&vr=0&play=1&mt=0`}
        ></iframe>
      </div>
    </MpSdkProvider>
  );
};
