import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "~/trpc/react";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

export const metadata = {
  title: "360Lab WebApp",
  description: "WebApp to interact with 360Lab tours",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const WindowSizeHandler = dynamic(
  () =>
    import("~/app/_components/window-size-handler").then(
      (mod) => mod.WindowSizeHandler,
    ),
  { ssr: false },
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("api/auth/signin");
  }

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <WindowSizeHandler />
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
