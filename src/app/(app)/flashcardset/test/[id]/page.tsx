import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import MagicBackButton from "@/components/magic-back-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { HydrateClient } from "@/trpc/server";

interface FlashcardSetTestPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function FlashcardSetTestPage({
  params,
  searchParams,
}: FlashcardSetTestPageProps) {
  return (
    <HydrateClient>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex w-full items-center justify-between px-4 md:justify-start">
              <div className="gap2 flex items-center">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                  orientation="vertical"
                />
              </div>
              <MagicBackButton />
            </div>
          </header>

          <main className="mx-auto flex w-full min-w-0 max-w-6xl justify-center py-4">
            <div className="flex w-full min-w-0 flex-col gap-8 px-4 pb-10">
              <Suspense fallback={<TestOptionsLoading />}>
                <CachedFlashcardSetTestPageContent
                  params={params}
                  searchParams={searchParams}
                />
              </Suspense>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </HydrateClient>
  );
}

async function CachedFlashcardSetTestPageContent({
  params,
  searchParams,
}: FlashcardSetTestPageProps) {
  const [{ id }, options] = await Promise.all([params, searchParams]);

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading font-semibold text-3xl tracking-normal">
            Hello world
          </h1>
          <p className="text-muted-foreground text-sm">
            Test route for flashcard set {id}.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test options</CardTitle>
          <CardDescription>
            Options passed from the test setup dialog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            <OptionRow
              label="Questions"
              value={getParamValue(options, "questions") ?? "Not set"}
            />
            <OptionRow
              label="Answer with"
              value={getParamValue(options, "answerWith") ?? "Not set"}
            />
            <OptionRow
              label="True/False"
              value={getBooleanParamValue(options, "trueFalse").toString()}
            />
            <OptionRow
              label="Multiple choice"
              value={getBooleanParamValue(options, "multipleChoice").toString()}
            />
            <OptionRow
              label="Matching"
              value={getBooleanParamValue(options, "matching").toString()}
            />
            <OptionRow
              label="Written"
              value={getBooleanParamValue(options, "written").toString()}
            />
            <OptionRow
              label="Instant response"
              value={getBooleanParamValue(
                options,
                "instantResponse"
              ).toString()}
            />
          </dl>
        </CardContent>
      </Card>
    </section>
  );
}

function TestOptionsLoading() {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading font-semibold text-3xl tracking-normal">
            Hello world
          </h1>
          <p className="text-muted-foreground text-sm">
            Loading test options...
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test options</CardTitle>
          <CardDescription>
            Options passed from the test setup dialog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid animate-pulse gap-3 sm:grid-cols-2">
            <div className="h-16 rounded-lg bg-muted" />
            <div className="h-16 rounded-lg bg-muted" />
            <div className="h-16 rounded-lg bg-muted" />
            <div className="h-16 rounded-lg bg-muted" />
            <div className="h-16 rounded-lg bg-muted" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function getParamValue(
  options: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = options[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getBooleanParamValue(
  options: Record<string, string | string[] | undefined>,
  key: string
) {
  return getParamValue(options, key) === "true";
}

function OptionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <dt className="font-medium text-muted-foreground text-sm">{label}</dt>
      <dd className="mt-1 break-words text-card-foreground">{value}</dd>
    </div>
  );
}
