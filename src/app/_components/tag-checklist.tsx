"use client";

import { useEffect, useState } from "react";

export const TagChecklist = (props: { tags: string[] }) => {
  const { tags } = props;

  const getChecked = () => {
    let checked: { [tag: string]: boolean } = {};
    tags.forEach((tag) => {
      checked[tag] =
        (localStorage.getItem(`seen-${tag}`) || "false") === "true";
    });
    return checked;
  };

  const [checked, setChecked] = useState(getChecked);

  useEffect(() => {
    const storageListener = (_ev: StorageEvent) => {
      setChecked(getChecked);
    };

    window.addEventListener("storage", storageListener);

    return () => window.removeEventListener("storage", storageListener);
  }, []);

  const uncheckAll = () => {
    tags.forEach((tag) => {
      localStorage.setItem(`seen-${tag}`, "false");
    });
    setChecked(getChecked);
  };

  return (
    <div className="flex flex-col">
      {tags.map((tag, idx) => (
        <div key={idx}>
          <input type="checkbox" checked={checked[tag]} value={tag} />
          <span>{tag}</span>
        </div>
      ))}
      <button onClick={uncheckAll}>Clear</button>
    </div>
  );
};
