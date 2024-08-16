"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { env } from "~/env";
import { Quiz } from "./quiz";

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
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <Quiz
            iframeWidth={iframeElement?.clientWidth}
            iframeHeight={iframeElement?.clientHeight}
          />
        </Suspense>
        <iframe
          ref={(el) => setIframeElement(el)}
          className="h-screen w-screen border-0"
          // width="853"
          // height="480"
          allowFullScreen
          src={`https://my.matterport.com/show/?m=${env.NEXT_PUBLIC_MATTERPORT_MODEL_ID}&brand=0&qs=1&views=0&hr=0&tagNav=0&search=0&vr=0&play=1&mt=0`}
        ></iframe>
      </div>
    </MpSdkProvider>
  );
};
