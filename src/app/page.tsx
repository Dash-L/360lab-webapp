"use client";

import { useEffect, useState } from "react";
import { TagChecklist } from "./_components/tag-checklist";

const Home = () => {
  return (
    <main className="flex flex-row">
      {/* NOTE: For accessibility, `outline-none` is bad, since outlines are usually used to display focus */}
      <iframe
        className="border-0 outline-none"
        width="853"
        height="480"
        allowFullScreen
        src={`https://my.matterport.com/show/?m=${process.env.NEXT_PUBLIC_MATTERPORT_MODEL_ID}&brand=0&qs=1`}
      ></iframe>
      <TagChecklist />
    </main>
  );
};

export default Home;
