import { redirect } from "next/navigation";
import { getUserLibrary } from "@/lib/user-library";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";

export const libraryRouter = createTRPCRouter({
  mine: privateProcedure.query(({ ctx }) => {
    const userId = ctx.user.id;

    if (!userId) {
      redirect("/auth");
    }

    return getUserLibrary(userId);
  }),
});
