import { headers } from "next/headers";
import { checkAuth } from "~/auth-helper";
import { Home } from "./_components/home-main";


const HomePage = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-current-path");
  await checkAuth(pathname);

  return (
    <main>
      <Home />
    </main>
  );
};

export default HomePage;
