"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { env } from "~/env";
import { TagChecklist } from "~/app/_components/tag-checklist";

const MpSdkProvider = dynamic(
  () =>
    import("~/app/_components/mpsdk-provider").then((mod) => mod.MpSdkProvider),
  { ssr: false },
);

const HomePage = () => {
  const [iframeElement, setIframeElement] = useState<HTMLIFrameElement | null>(
    null,
  );

  return (
    <main>
      <MpSdkProvider iframeElement={iframeElement}>
        <div className="h-[calc(var(--vh,1vh)*100)] w-[calc(var(--vw,1vw)*100)]">
          <TagChecklist />
          <iframe
            ref={(el) => setIframeElement(el)}
            className="h-full w-full border-0"
            src={`https://my.matterport.com/show/?m=${env.NEXT_PUBLIC_MATTERPORT_MODEL_ID}&brand=0&qs=1&views=0&hr=0&tagNav=0&search=0&vr=0&play=1`}
          ></iframe>
        </div>
      </MpSdkProvider>
    </main>
  );
};

export default HomePage;
