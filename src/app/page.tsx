import { getServerAuthSession } from "~/server/auth";
import Link from "next/link";
import { HomePage } from "./_components/home";

const Home = async () => {
  const session = await getServerAuthSession();

  if (session === null) {
    return <Link href="api/auth/signin">Sign In</Link>;
  }

  return (
    <main className="flex flex-row">
      <HomePage />
      <div className="flex-row space-x-4 ml-auto mr-10">
        <span>Logged in as {session.user.name}</span>
        <Link href="api/auth/signout">Sign Out</Link>
      </div>
    </main>
  );
};

export default Home;
