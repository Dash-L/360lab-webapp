import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { quizQuestions, quizzes } from "~/server/db/schema";

const validQuizTagLabels = [
  "Sink",
  "Emergency Shower",
  "Emergency Eyewash",
  "Broken Glass Disposal",
  "Biohazard Waste",
];

export const quizRouter = createTRPCRouter({
  startQuiz: protectedProcedure.mutation(async ({ ctx }) => {
    // Create a new quiz
    const newQuiz = (
      await ctx.db
        .insert(quizzes)
        .values({ userId: ctx.session.user.id })
        .returning()
    )[0]!;
    // Create 3 random quiz questions
    // Pick one to set as current
    let indices = new Set<number>();
    while (indices.size < 3) {
      indices.add(Math.floor(Math.random() * validQuizTagLabels.length));
    }

    const questions = await ctx.db
      .insert(quizQuestions)
      .values(
        Array.from(indices).map((i) => ({
          quizId: newQuiz.id,
          tagName: validQuizTagLabels[i]!,
        })),
      )
      .returning();
    const firstQuestion = questions[0]!;
    await ctx.db
      .update(quizzes)
      .set({ currentQuestion: firstQuestion.id })
      .where(eq(quizzes.id, newQuiz.id));
  }),
  getQuiz: protectedProcedure.query(async ({ ctx }) => {
    const currentQuiz = await ctx.db.query.quizzes.findFirst({
      where: and(
        eq(quizzes.userId, ctx.session.user.id),
        isNull(quizzes.completedAt),
      ),
      with: {
        quizQuestions: {
          columns: { id: true, tagName: true },
        },
      },
    });

    if (currentQuiz) {
      const currentQuestion = currentQuiz.quizQuestions.find(
        (question) => question.id === currentQuiz.currentQuestion,
      );
      return currentQuestion!;
    } else {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "no unfinished quiz found",
      });
    }
  }),
  submitQuestion: protectedProcedure
    .input(
      z.object({
        position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Find the current quiz
      const currentQuiz = await ctx.db.query.quizzes.findFirst({
        where: and(
          eq(quizzes.userId, ctx.session.user.id),
          isNull(quizzes.completedAt),
        ),
        with: {
          quizQuestions: {
            columns: { id: true, tagName: true },
          },
        },
      });
      if (!currentQuiz) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "There is no active quiz",
        });
      }
      // Find the closest tag to the guess
      const mattertags = await ctx.db.query.tags.findMany();
      let distances = mattertags.map((tag) => ({
        id: tag.id,
        dist: Math.sqrt(
          (tag.posX - input.position.x) ** 2 +
            (tag.posY + input.position.z) ** 2 +
            (tag.posZ - input.position.y) ** 2,
        ),
      }));
      distances.sort((a, b) => a.dist - b.dist);
      // Set current question's completion time and guessed coordinates
      await ctx.db
        .update(quizQuestions)
        .set({
          completedAt: new Date(),
          selectedX: input.position.x,
          selectedY: input.position.y,
          selectedZ: input.position.z,
          nearestTag: distances[0]!.id,
        })
        .where(eq(quizQuestions.id, currentQuiz.currentQuestion!));
      // Find a new question on this quiz that isn't completed and return it
      const newQuestion = await ctx.db.query.quizQuestions.findFirst({
        where: and(
          eq(quizQuestions.quizId, currentQuiz.id),
          isNull(quizQuestions.completedAt),
        ),
        columns: {
          id: true,
          tagName: true,
        },
      });

      if (!newQuestion) {
        // Quiz Completed, no next question
        await ctx.db
          .update(quizzes)
          .set({ completedAt: new Date() })
          .where(eq(quizzes.id, currentQuiz.id));
      } else {
        await ctx.db
          .update(quizzes)
          .set({ currentQuestion: newQuestion.id })
          .where(eq(quizzes.id, currentQuiz.id));
      }
    }),
});
