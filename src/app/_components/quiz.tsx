import type { MpSdk } from "@matterport/sdk";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { MpSdkContext } from "~/mp_sdk_context";
import { api } from "~/trpc/react";

export const Quiz = (props: {
  iframeWidth: number | undefined;
  iframeHeight: number | undefined;
}) => {
  const router = useRouter();

  const utils = api.useUtils();
  const {
    data: currentQuestion,
    isLoading,
    isError,
    error,
  } = api.quiz.getQuiz.useQuery();
  const submitQuestion = api.quiz.submitQuestion.useMutation({
    onSuccess: () => {
      utils.quiz.getQuiz.invalidate();
    },
  });

  const mpSdk = useContext(MpSdkContext);

  const { iframeWidth, iframeHeight } = props;

  const [lastIntersectionTime, setLastIntersectionTime] = useState(
    new Date().getTime(),
  );
  const [lastIntersection, setLastIntersection] =
    useState<MpSdk.Pointer.Intersection>();
  const [lastPose, setLastPose] = useState<MpSdk.Camera.Pose>();
  const [buttonVisible, setButtonVisible] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (mpSdk) {
      const pointerSubscription = mpSdk.Pointer.intersection.subscribe(
        (intersection: MpSdk.Pointer.Intersection) => {
          setLastIntersection(intersection);
          setLastIntersectionTime(new Date().getTime());
          setButtonVisible(false);
        },
      );

      const poseSubscription = mpSdk.Camera.pose.subscribe(
        (pose: MpSdk.Camera.Pose) => {
          setLastPose(pose);
        },
      );

      return () => {
        pointerSubscription.cancel();
        poseSubscription.cancel();
      };
    }
  }, [mpSdk]);

  useEffect(() => {
    if (mpSdk) {
      if (lastIntersection && lastPose && iframeWidth && iframeHeight) {
        const interval = setInterval(() => {
          if (new Date().getTime() > lastIntersectionTime + 1000) {
            setButtonVisible(true);
            const coords = mpSdk.Conversion.worldToScreen(
              lastIntersection.position,
              lastPose,
              { w: iframeWidth, h: iframeHeight },
            );

            setButtonPosition({ top: coords.y - 15, left: coords.x - 20 });
          }
        }, 16);

        return () => clearInterval(interval);
      }
    }
  }, [
    mpSdk,
    iframeWidth,
    iframeHeight,
    lastIntersectionTime,
    lastIntersection,
    lastPose,
  ]);

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  if (currentQuestion === null) {
    router.push("/");
  }

  return (
    <div className="pointer-events-none absolute h-screen w-screen">
      <div className="absolute right-0 h-screen">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="pointer-events-auto mr-8 flex w-40 flex-col bg-gray-600/60 py-1 text-slate-300">
            Find: {currentQuestion!.tagName}
          </div>
        )}
      </div>
      <button
        className={`${buttonVisible ? "absolute block" : "hidden"} pointer-events-auto rounded bg-white px-1`}
        style={{ top: buttonPosition.top, left: buttonPosition.left }}
        onClick={() => {
          if (confirm("Really submit?")) {
            submitQuestion.mutate({ position: lastIntersection!.position });
          }
        }}
      >
        Submit
      </button>
    </div>
  );
};
