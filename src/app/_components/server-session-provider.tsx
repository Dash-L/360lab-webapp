"use client";

import { ReactNode } from "react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

export const ServerSessionProvider = (props: {
  session: Session | null;
  children: ReactNode | ReactNode[];
}) => {
  const { session, children } = props;

  return <SessionProvider session={session}>{children}</SessionProvider>;
};
