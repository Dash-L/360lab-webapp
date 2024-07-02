'use client'

import { useEffect, useState } from "react";

export default function Home() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const handleCount = () => {
      setCount(parseInt(localStorage.getItem("count") || "0"));
    };

    const handleCountListener = (_ev: StorageEvent) => handleCount();

    handleCount();

    window.addEventListener("storage", handleCountListener);

    return () => window.removeEventListener("storage", handleCountListener);
  }, []);
  return <>
    <div>{count}</div>
    <iframe width='853' height='480' allowFullScreen src={`https://my.matterport.com/show/?m=${process.env.NEXT_PUBLIC_MATTERPORT_MODEL_ID}&brand=0&qs=1`}></iframe>
  </>;
}
