import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { env } from "~/env";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { tags, usersToTags, visits } from "~/server/db/schema";

const matterportAPIUrl = "https://api.matterport.com/api/models/graph";

const fetchOpts: RequestInit = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Basic ${Buffer.from(`${env.MATTERPORT_API_TOKEN}:${env.MATTERPORT_API_SECRET}`).toString("base64")}`,
  },
};

type Tag = {
  id: string;
  label: string;
  anchorPosition: { x: number; y: number; z: number };
};

type MattertagQueryOutput = {
  data: {
    model: {
      mattertags: Tag[];
    };
  };
};

export const matterportRouter = createTRPCRouter({
  tags: protectedProcedure
    .input(z.object({ modelId: z.string() }))
    // WARNING: This is *mostly* a query, but does cache the tags in the db. It still always makes a request to the Matterport API, to avoid problems with stale togs
    .query(async ({ ctx, input }) => {
      const { data } = (await fetch(matterportAPIUrl, {
        ...fetchOpts,
        body: JSON.stringify({
          query: `{
            model(id: "${input.modelId}") {
              mattertags {
                id
                label
                anchorPosition {
                  x y z
                }
              }
            }
          }`,
        }),
      }).then((r) => r.json())) as MattertagQueryOutput;

      const excludedTagLabel = sql.raw(`excluded.${tags.label.name}`);

      await ctx.db
        .insert(tags)
        .values(
          data.model.mattertags.map((tag: Tag) => ({
            ...tag,
            posX: tag.anchorPosition.x,
            posY: tag.anchorPosition.y,
            posZ: tag.anchorPosition.z,
          })),
        )
        .onConflictDoUpdate({
          target: tags.id,
          set: { label: excludedTagLabel },
          setWhere: sql`${tags.label} != ${excludedTagLabel}`,
        });

      await ctx.db
        .insert(usersToTags)
        .values(
          data.model.mattertags.map((tag: Tag) => ({
            userId: ctx.session.user.id,
            tagId: tag.id,
          })),
        )
        .onConflictDoNothing();

      const userTagVisits = await ctx.db.query.visits.findMany({
        where: eq(visits.userId, ctx.session.user.id),
        columns: { tagId: true },
      });

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
      ) as Record<string, { label: string; seen: boolean }>;
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
