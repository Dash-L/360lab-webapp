"use client";

import { MpSdk } from "@matterport/sdk";
import { useContext, useEffect, useState } from "react";
import { env } from "~/env";
import { MpSdkContext } from "~/mp_sdk_context";
import { api } from "~/trpc/react";

export const TagChecklist = () => {
  const tagQuery = api.matterport.tags.useQuery({
    modelId: env.NEXT_PUBLIC_MATTERPORT_MODEL_ID,
  });

  const [tags, setTags] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    if (tagQuery.isFetched) {
      setTags(
        Object.fromEntries(
          tagQuery.data.model.mattertags.map(
            (tag: { id: string; label: string }) => [tag.id, tag.label],
          ),
        ),
      );
    }
  }, [tagQuery.isFetched]);

  const getChecked = () => {
    return Object.fromEntries(
      Object.entries(tags).map(([_, label]) => [
        label,
        (localStorage.getItem(`seen-${label}`) || "false") === "true",
      ]),
    );
  };

  // getChecked will return an empty dictionary on first load, the function call is basically just for type inference
  const [checked, setChecked] = useState(getChecked);

  const mpSdk = useContext(MpSdkContext);

  useEffect(() => {
    if (mpSdk) {
      const subscription = mpSdk.Tag.openTags.subscribe(
        (openTags: MpSdk.Tag.OpenTags) => {
          console.info("[360lab] got OpenTags event from mpSdk:", openTags);
          const selectedId = openTags.selected.keys().next().value;
          if (selectedId !== null) {
            const label = tags[selectedId];
            localStorage.setItem(`seen-${label}`, "true");
            setChecked(getChecked);
          }
        },
      );

      return subscription.cancel;
    }
  }, [mpSdk]);

  useEffect(() => {
    if (Object.entries(tags).length !== 0) {
      console.info("[360lab] fetched tags:", tags);
    }
    setChecked(getChecked);
  }, [tags]);

  useEffect(() => {
    const storageListener = (_ev: StorageEvent) => {
      setChecked(getChecked);
    };

    window.addEventListener("storage", storageListener);

    return () => window.removeEventListener("storage", storageListener);
  }, []);

  const uncheckAll = () => {
    Object.entries(tags).forEach(([_, label]) => {
      localStorage.setItem(`seen-${label}`, "false");
    });
    setChecked(getChecked);
  };

  if (tagQuery.isPending) {
    return <div>Loading...</div>;
  }

  if (tagQuery.isError) {
    return <div>Error: {tagQuery.error.message}</div>;
  }

  return (
    <div className="flex flex-col">
      {Object.entries(tags).map(([_, label], idx: number) => (
        <div key={idx}>
          {/* defaulting checked[tag] to false isn't really necessary, it just gets rid of an error where react thinks this input has changed from unmanaged to managed */}
          <input
            type="checkbox"
            readOnly
            checked={checked[label] ?? false}
            value={label}
          />
          <span>{label}</span>
        </div>
      ))}
      <button onClick={uncheckAll}>Clear</button>
    </div>
  );
};
