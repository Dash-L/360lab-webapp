import type { MpSdk } from "@matterport/sdk";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { MpSdkContext } from "~/mp_sdk_context";
import { api } from "~/trpc/react";

export const Quiz = (props: {
  iframeWidth: number | undefined;
  iframeHeight: number | undefined;
}) => {
  const utils = api.useUtils();

  const router = useRouter();

  const [currentQuestion, _currentQuestionQuery] =
    api.quiz.getQuiz.useSuspenseQuery();

  const [scores, _scoresQuery] = api.quiz.getScores.useSuspenseQuery();

  const submitQuestion = api.quiz.submitQuestion.useMutation({
    onSuccess: async (done) => {
      if (done) {
        router.push("/");
      }

      await utils.quiz.getQuiz.invalidate();
      await utils.quiz.getScores.invalidate();
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

  return (
    <div className="pointer-events-none absolute h-screen w-screen">
      <div className="absolute right-0 h-screen">
        <div className="pointer-events-auto mr-8 flex w-40 flex-col bg-gray-600/60 py-1 text-slate-300">
          <div className="space-around mx-auto flex flex-row">
            {scores.map((score, i) => (
              <div
                key={i}
                className={`rounded-full ${score === null ? "bg-white" : score ? "bg-green-500" : "bg-red-500"} mx-2 h-5 w-5`}
              ></div>
            ))}
          </div>
          <p>Find: {currentQuestion.question.tagName}</p>
        </div>
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
