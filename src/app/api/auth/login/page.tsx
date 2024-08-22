"use client";
import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const callbackUrl = (searchParams?.callbackUrl as string) ?? "/";

  useEffect(() => {
    signIn("azure-ad", { callbackUrl });
  }, []);

  return <></>;
}
