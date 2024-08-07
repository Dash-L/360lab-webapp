import { MpSdk } from "@matterport/sdk";
import { inferRouterOutputs } from "@trpc/server";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { env } from "~/env";
import { MpSdkContext } from "~/mp_sdk_context";
import { AppRouter } from "~/server/api/root";
import { api } from "~/trpc/react";
import { ProgressCircle } from "./progress-circle";

export const TagChecklist = () => {
  const tagQuery = api.matterport.tags.useQuery({
    modelId: env.NEXT_PUBLIC_MATTERPORT_MODEL_ID,
  });

  const utils = api.useUtils();

  const visitTag = api.matterport.viewTag.useMutation({
    onSuccess: () => utils.matterport.tags.invalidate(),
  });
  const unvisitTag = api.matterport.deleteViews.useMutation();

  const [tags, setTags] = useState<
    inferRouterOutputs<AppRouter>["matterport"]["tags"]
  >({});

  useEffect(() => {
    if (tagQuery.data) {
      setTags(tagQuery.data);
    }
  }, [tagQuery.data]);

  const mpSdk = useContext(MpSdkContext);

  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (mpSdk) {
      const subscription = mpSdk.Tag.openTags.subscribe(
        (openTags: MpSdk.Tag.OpenTags) => {
          console.info("[360lab] got OpenTags event from mpSdk:", openTags);
          const selectedId = openTags.selected.keys().next().value;
          if (selected !== selectedId) {
            console.info(`\tID: ${selectedId}`);
            setSelected(selectedId ?? "");

            if (selectedId !== undefined) {
              const tagData = tags[selectedId];
              console.log(`\tData: ${JSON.stringify(tagData)}`);

              if (tagData !== undefined) {
                console.info(`\tMarking ${tagData.label} as seen`);
                visitTag.mutate({ tagId: selectedId });
              }
            }
          }
        },
      );

      return () => subscription.cancel();
    }
  }, [mpSdk, tags, selected]);

  const uncheckAll = () => {
    Object.keys(tags).forEach((id) => {
      unvisitTag.mutate({ tagId: id });
    });
    utils.matterport.tags.invalidate();
  };

  const router = useRouter();

  if (tagQuery.isError) {
    return <div>Error: {tagQuery.error.message}</div>;
  }

  const seen = Object.values(tags).filter((tag) => tag.seen).length;
  const total = Object.values(tags).length;

  return (
    <div className="absolute right-0 h-screen overflow-hidden hover:overflow-scroll">
      <div className="mr-8 flex w-40 flex-col bg-gray-600/60 py-1 text-slate-300">
        {tagQuery.isPending ? (
          <p>Loading...</p>
        ) : (
          <>
            <ProgressCircle
              className="self-center"
              size={60}
              strokeWidth={5}
              progress={seen / total}
            />
            <span className="self-center">
              Tags: {seen}/{total}
            </span>
          </>
        )}
        <button onClick={uncheckAll}>Clear</button>
        <button onClick={() => router.push("/quiz")}>Done</button>
        <button
          className="text-red-300"
          onClick={() => router.push("/api/auth/signout")}
        >
          Sign Out
        </button>
        {/*Object.entries(tags).map(([id, { label, seen }], idx: number) => (
        <div key={idx}>
          <input type="checkbox" readOnly checked={seen} value={id} />
          <span>{label}</span>
        </div>
      ))*/}
      </div>
    </div>
  );
};
