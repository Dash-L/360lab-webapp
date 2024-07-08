"use client";

import { useEffect, useState } from "react";
import { env } from "~/env";
import { api } from "~/trpc/react";

export const TagChecklist = () => {
  const tagQuery = api.matterport.tags.useQuery({
    modelId: env.NEXT_PUBLIC_MATTERPORT_MODEL_ID,
  });

  const tags = () => {
    if (tagQuery.isFetched)
      return tagQuery.data.model.mattertags.map(
        (tag: { label: string }) => tag.label,
      );
    return [];
  };

  const getChecked = () => {
    let checked: { [tag: string]: boolean } = {};
    tags().forEach((tag: string) => {
      checked[tag] =
        (localStorage.getItem(`seen-${tag}`) || "false") === "true";
    });
    return checked;
  };

  // getChecked will return an empty dictionary on first load, the function call is basically just for type inference
  const [checked, setChecked] = useState(getChecked);

  useEffect(() => {
    setChecked(getChecked);
  }, [tagQuery.isFetched]);

  useEffect(() => {
    const storageListener = (_ev: StorageEvent) => {
      setChecked(getChecked);
    };

    window.addEventListener("storage", storageListener);

    return () => window.removeEventListener("storage", storageListener);
  }, []);

  const uncheckAll = () => {
    tags().forEach((tag: string) => {
      localStorage.setItem(`seen-${tag}`, "false");
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
      {tags().map((tag: string, idx: number) => (
        <div key={idx}>
          {/* defaulting checked[tag] to false isn't really necessary, it just gets rid of an error where react thinks this input has changed from unmanaged to managed */}
          <input
            type="checkbox"
            readOnly
            checked={checked[tag] ?? false}
            value={tag}
          />
          <span>{tag}</span>
        </div>
      ))}
      <button onClick={uncheckAll}>Clear</button>
    </div>
  );
};
