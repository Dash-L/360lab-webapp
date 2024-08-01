import { getServerAuthSession } from "~/server/auth";
import { HomePage } from "~/app/_components/home";
import { ServerSessionProvider } from "~/app/_components/server-session-provider";

const Home = async () => {
  const session = await getServerAuthSession();

  // if (session === null) {
  //   return <Link href="api/auth/signin">Sign In</Link>;
  // }

  return (
    <main>
    <ServerSessionProvider session={session}>
      <HomePage />
      {/*
      <div className="flex-row space-x-4 ml-auto mr-10">
        <span>Logged in as {session.user.name}</span>
        <Link href="api/auth/signout">Sign Out</Link>
      </div>
    */}
    </ServerSessionProvider>
    </main>
  );
};

export default Home;
