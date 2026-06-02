"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { LibraryContent } from "./library-content";

export function LibraryPageContent() {
  const router = useRouter();
  const { status } = useSession();
  const libraryQuery = api.library.mine.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth");
    }
  }, [router, status]);

  if (status === "loading" || libraryQuery.isLoading) {
    return <LibraryPageContentSkeleton />;
  }

  if (libraryQuery.error) {
    return (
      <Card className="mx-4 w-full max-w-6xl border-dashed" size="sm">
        <CardContent className="flex min-h-40 items-center justify-center text-center text-muted-foreground">
          Unable to load your library.
        </CardContent>
      </Card>
    );
  }

  if (!libraryQuery.data) {
    return null;
  }

  return <LibraryContent library={libraryQuery.data} />;
}

function LibraryPageContentSkeleton() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-8 px-4 pb-10">
      <section className="flex min-w-0 flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-px w-full" />
      </section>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
