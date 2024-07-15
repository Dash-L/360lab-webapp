import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { env } from "~/env";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { tags, users, usersToTags, visits } from "~/server/db/schema";

const matterportAPIUrl = "https://api.matterport.com/api/models/graph";

const fetchOpts: RequestInit = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Basic ${Buffer.from(`${env.MATTERPORT_API_TOKEN}:${env.MATTERPORT_API_SECRET}`).toString("base64")}`,
  },
};

export const matterportRouter = createTRPCRouter({
  tags: protectedProcedure
    .input(z.object({ modelId: z.string() }))
    // WARNING: This is *mostly* a query, but does cache the tags in the db. It still always makes a request to the Matterport API, to avoid problems with stale togs
    .query(async ({ ctx, input }) => {
      const { data } = await fetch(matterportAPIUrl, {
        ...fetchOpts,
        body: JSON.stringify({
          query: `{
            model(id: "${input.modelId}") {
              mattertags {
                id
                label
              }
            }
          }`,
        }),
      }).then((r) => r.json());

      const excludedTagLabel = sql.raw(`excluded.${tags.label.name}`);

      await ctx.db
        .insert(tags)
        .values(data.model.mattertags)
        .onConflictDoUpdate({
          target: tags.id,
          set: { label: excludedTagLabel },
          setWhere: sql`${tags.label} != ${excludedTagLabel}`,
        })

      await ctx.db
        .insert(usersToTags)
        .values(
          data.model.mattertags.map((tag: { id: string; label: string }) => ({
            userId: ctx.session.user.id,
            tagId: tag.id,
          })),
        )
        .onConflictDoNothing()

      const userTagVisits = await ctx.db.query.visits
        .findMany({
          where: eq(visits.userId, ctx.session.user.id),
          columns: { tagId: true },
        })

      return Object.fromEntries(
        data.model.mattertags.map((tag: { id: string; label: string }) => [
          tag.id,
          {
            label: tag.label,
            seen:
              userTagVisits.filter((visit) => visit.tagId === tag.id).length !=
              0,
          },
        ]),
      ) as { [id: string]: { label: string; seen: boolean } };

      // const res = await ctx.db.query.users.findFirst({
      //   where: eq(users.id, ctx.session.user.id),
      //   columns: {},
      //   with: {
      //     usersToTags: {
      //       columns: { tagId: true },
      //       with: {
      //         visits: true,
      //       },
      //     },
      //   },
      // });
    }),

  viewTag: protectedProcedure
    .input(z.object({ tagId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(visits)
        .values({ userId: ctx.session.user.id, tagId: input.tagId });
    }),

  deleteViews: protectedProcedure
    .input(z.object({ tagId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(visits)
        .where(
          and(
            eq(visits.userId, ctx.session.user.id),
            eq(visits.tagId, input.tagId),
          ),
        );
    }),
});
