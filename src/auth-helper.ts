import { redirect } from "next/navigation";
import { getServerAuthSession } from "./server/auth";

export const checkAuth = async (callbackUrl?: string | null) => {
  const session = await getServerAuthSession();
  if (!session) {
    const url =
      "/api/auth/login" + (callbackUrl ? `?callbackUrl=${callbackUrl}` : "");
    redirect(url);
  }
};
