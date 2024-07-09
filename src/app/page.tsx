"use client";

import { useRef, useState } from "react";
import { env } from "~/env";
import dynamic from "next/dynamic";

const TagChecklist = dynamic(
  () => import("./_components/tag-checklist").then((mod) => mod.TagChecklist),
  { ssr: false },
);

const MpSdkProvider = dynamic(
  () => import("./_components/mpsdk-provider").then((mod) => mod.MpSdkProvider),
  { ssr: false },
);

const Home = () => {
  const [iframeElement, setIframeElement] = useState<HTMLIFrameElement | null>(null);

  return (
    <MpSdkProvider iframeElement={iframeElement}>
      <main className="flex flex-row">
        {/* NOTE: For accessibility, `outline-none` is bad, since outlines are usually used to display focus */}
        <iframe
          ref={(el) => setIframeElement(el)}
          className="border-0 outline-none"
          width="853"
          height="480"
          allowFullScreen
          src={`https://my.matterport.com/show/?m=${env.NEXT_PUBLIC_MATTERPORT_MODEL_ID}&brand=0&qs=1`}
        ></iframe>
        <TagChecklist />
      </main>
    </MpSdkProvider>
  );
};

export default Home;
