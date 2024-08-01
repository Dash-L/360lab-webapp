"use client";

import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { env } from "~/env";
import { TagChecklist } from "./tag-checklist";

const MpSdkProvider = dynamic(
  () => import("./mpsdk-provider").then((mod) => mod.MpSdkProvider),
  { ssr: false },
);

export const HomePage = () => {
  const [iframeElement, setIframeElement] = useState<HTMLIFrameElement | null>(
    null,
  );

  const router = useRouter();

  const { data: session } = useSession();

  return (
    <MpSdkProvider iframeElement={iframeElement}>
      <div>
        {session ? (
          <TagChecklist />
        ) : (
          <div>
            <div className="absolute block h-screen w-screen"></div>
            <div className="absolute bottom-0 left-0 right-0 top-0 m-auto flex h-10 w-3/12 content-center justify-center bg-blue-800/75 py-0">
              <button onClick={() => router.push("/api/auth/signin")}>
                Sign In
              </button>
            </div>
          </div>
        )}
        <iframe
          ref={(el) => setIframeElement(el)}
          className="h-screen w-screen border-0"
          // width="853"
          // height="480"
          allowFullScreen
          src={`https://my.matterport.com/show/?m=${env.NEXT_PUBLIC_MATTERPORT_MODEL_ID}&brand=0&qs=1&views=0&hr=0&tagNav=0&search=0&vr=0&play=1`}
        ></iframe>
      </div>
    </MpSdkProvider>
  );
};
