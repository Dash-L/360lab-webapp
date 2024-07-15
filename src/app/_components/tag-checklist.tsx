"use client";

import { MpSdk } from "@matterport/sdk";
import { inferRouterOutputs } from "@trpc/server";
import { useContext, useEffect, useState } from "react";
import { env } from "~/env";
import { MpSdkContext } from "~/mp_sdk_context";
import { AppRouter } from "~/server/api/root";
import { api } from "~/trpc/react";

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

      return subscription.cancel;
    }
  }, [mpSdk, tags, selected]);

  const uncheckAll = () => {
    Object.keys(tags).forEach((id) => {
      unvisitTag.mutate({ tagId: id });
    });
    utils.matterport.tags.invalidate();
  };

  if (tagQuery.isPending) {
    return <div>Loading...</div>;
  }

  if (tagQuery.isError) {
    return <div>Error: {tagQuery.error.message}</div>;
  }

  return (
    <div className="flex flex-col">
      {Object.entries(tags).map(([id, { label, seen }], idx: number) => (
        <div key={idx}>
          <input type="checkbox" readOnly checked={seen} value={id} />
          <span>{label}</span>
        </div>
      ))}
      <button onClick={uncheckAll}>Clear</button>
    </div>
  );
};
