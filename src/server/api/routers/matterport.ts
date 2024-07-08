import { z } from "zod";
import { env } from "~/env";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

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
  tags: publicProcedure
    .input(z.object({ modelId: z.string() }))
    .query(async ({ input }) => {
      const { data } = await fetch(matterportAPIUrl, {
        ...fetchOpts,
        body: JSON.stringify({
          query: `{
            model(id: "${input.modelId}") {
              mattertags {
                label
              }
            }
          }`,
        }),
      }).then((r) => r.json());

      return data;
    }),
});
