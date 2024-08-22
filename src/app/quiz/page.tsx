import { headers } from "next/headers";
import { checkAuth } from "~/auth-helper";
import { QuizMain } from "../_components/quiz-main";

const QuizPage = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-current-path");
  await checkAuth(pathname);

  return (
    <main>
      <QuizMain />
    </main>
  );
};

export default QuizPage;
