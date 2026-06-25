"use client";

import { Cards01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CalendarIcon,
  ChevronDownIcon,
  CopyIcon,
  FolderIcon,
  GraduationCapIcon,
  MessageSquareWarningIcon,
  MoreHorizontalIcon,
  SearchIcon,
  ShareIcon,
  StarIcon,
  TrashIcon,
  UserPlusIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { LibraryItemCard } from "@/components/pages/(app)/shared/library-item-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { flashcardSetVisibilityLabels } from "@/lib/flashcard-set-visibility";
import type { UserProfile } from "@/schemas/user-profile-schema";

type FlashcardSet = UserProfile["flashcardSets"][number];
type FilterValue = "all" | "recent" | "high-score" | "needs-practice";
type SortValue = "latest" | "score" | "terms";
type VisibilityValue = "all" | FlashcardSet["visibility"];

const SORT_LABELS: Record<SortValue, string> = {
  latest: "Latest",
  score: "Score",
  terms: "Terms",
};

const VISIBILITY_LABELS: Record<VisibilityValue, string> = {
  all: "All visibility",
  ...flashcardSetVisibilityLabels,
};

export function ProfileContent({ profile }: { profile: UserProfile }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [category, setCategory] = useState("all");
  const [visibility, setVisibility] = useState<VisibilityValue>("all");
  const [sort, setSort] = useState<SortValue>("latest");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          profile.flashcardSets.map((set) => set.description ?? "Uncategorized")
        )
      ),
    [profile.flashcardSets]
  );

  const visibleStudySets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return profile.flashcardSets
      .filter((set) => {
        const searchableDescription = set.description ?? "";
        const matchesSearch =
          normalizedQuery.length === 0 ||
          set.title.toLowerCase().includes(normalizedQuery) ||
          searchableDescription.toLowerCase().includes(normalizedQuery);
        const matchesCategory =
          category === "all" ||
          (set.description ?? "Uncategorized") === category;
        const matchesVisibility =
          visibility === "all" || set.visibility === visibility;
        const matchesFilter =
          filter === "all" ||
          (filter === "recent" && set.sectionLabel === "This month") ||
          (filter === "high-score" && set.avgScore >= 80) ||
          (filter === "needs-practice" && set.avgScore < 75);

        return (
          matchesSearch && matchesCategory && matchesVisibility && matchesFilter
        );
      })
      .sort((firstSet, secondSet) => {
        if (sort === "score") {
          return secondSet.avgScore - firstSet.avgScore;
        }

        if (sort === "terms") {
          return secondSet.flashcardCount - firstSet.flashcardCount;
        }

        return secondSet.studiedAtOrder - firstSet.studiedAtOrder;
      });
  }, [category, filter, profile.flashcardSets, query, sort, visibility]);

  const groupedStudySets = useMemo(
    () => groupStudySetsBySection(visibleStudySets),
    [visibleStudySets]
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 px-4 pb-10">
      <ProfileHeader profile={profile} />

      <Tabs className="gap-6" defaultValue="flashcard-sets">
        <div className="overflow-x-auto">
          <TabsList className="min-w-max" variant="line">
            <TabsTrigger value="flashcard-sets">Flashcard sets</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="folders">Folders</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="flex flex-col gap-6" value="flashcard-sets">
          <StudySetToolbar
            categories={categories}
            category={category}
            filter={filter}
            onCategoryChange={setCategory}
            onFilterChange={setFilter}
            onQueryChange={setQuery}
            onSortChange={setSort}
            onVisibilityChange={setVisibility}
            query={query}
            sort={sort}
            visibility={visibility}
          />

          <div className="flex min-w-0 flex-col gap-5">
            {groupedStudySets.map(([sectionLabel, sets]) => (
              <section
                className="flex min-w-0 flex-col gap-2"
                key={sectionLabel}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <h2 className="font-heading font-semibold text-muted-foreground text-xs uppercase tracking-normal">
                    {sectionLabel}
                  </h2>
                  <Separator className="flex-1" />
                </div>
                <div className="grid min-w-0 gap-x-4 gap-y-5 lg:grid-cols-1">
                  {sets.map((set) => (
                    <StudySetRow
                      author={profile.username}
                      key={set.id}
                      set={set}
                    />
                  ))}
                </div>
              </section>
            ))}

            {visibleStudySets.length === 0 && (
              <div className="flex min-w-0 flex-col gap-1 py-2">
                <h2 className="font-heading font-semibold text-muted-foreground text-xs uppercase tracking-normal">
                  No flashcard sets found
                </h2>
                <span className="text-muted-foreground">
                  Try a different search term or clear one of the filters.
                </span>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent className="grid gap-3 sm:grid-cols-1" value="classes">
          {profile.classes.map((classroom) => (
            <LibraryItemCard
              action={<ProfileItemAction title={classroom.name} />}
              icon={<GraduationCapIcon className="size-5 text-emerald-400" />}
              itemId={classroom.id}
              itemType="classroom"
              key={classroom.id}
              metadata={`${classroom.memberCount} members · ${classroom.setCount} sets`}
              title={classroom.name}
            />
          ))}
        </TabsContent>

        <TabsContent className="grid gap-3 sm:grid-cols-1" value="folders">
          {profile.folders.map((folder) => (
            <LibraryItemCard
              action={<ProfileItemAction title={folder.name} />}
              icon={<FolderIcon className="size-5 text-amber-400" />}
              itemId={folder.id}
              itemType="folder"
              key={folder.id}
              metadata={`${folder.setCount} sets`}
              title={folder.name}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileHeader({ profile }: { profile: UserProfile }) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-5">
        <div className="flex w-full min-w-0 flex-col justify-between gap-4 md:flex-row">
          <div className="flex min-w-0 flex-row items-start gap-5 max-md:flex-col md:items-center">
            <Avatar className="size-32 after:rounded-2xl" size="default">
              <AvatarImage
                alt={profile.name}
                className="rounded-2xl"
                src={profile.avatarUrl}
              />
              <AvatarFallback className="rounded-2xl">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <h1 className="truncate font-heading font-semibold text-2xl tracking-normal">
                    {profile.username}
                  </h1>
                  <p className="text-muted-foreground text-sm">{profile.bio}</p>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-3 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon />
                    {profile.joinedAt}
                  </span>
                  <div className="flex items-center gap-3">
                    <ProfileMeta value={`${profile.stats.sets} Sets`} />
                    <ProfileMeta value={`${profile.stats.friends} friends`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <ButtonGroup className="w-full md:w-fit">
              <Button
                className="flex-1 md:flex-none"
                type="button"
                variant="default"
              >
                <UserPlusIcon data-icon="inline-start" />
                Add friend
              </Button>
              <ProfileMoreMenu />
            </ButtonGroup>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileMeta({ value }: { value: string }) {
  return (
    <span className="flex items-center gap-3">
      <span aria-hidden="true">·</span>
      <span>{value}</span>
    </span>
  );
}

function ProfileMoreMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" type="button" variant="secondary">
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <CopyIcon />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <MessageSquareWarningIcon />
            Report
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StudySetToolbar({
  categories,
  category,
  onCategoryChange,
  onQueryChange,
  onSortChange,
  onVisibilityChange,
  query,
  sort,
  visibility,
}: {
  categories: string[];
  category: string;
  filter: FilterValue;
  onCategoryChange: (value: string) => void;
  onFilterChange: (value: FilterValue) => void;
  onQueryChange: (value: string) => void;
  onSortChange: (value: SortValue) => void;
  onVisibilityChange: (value: VisibilityValue) => void;
  query: string;
  sort: SortValue;
  visibility: VisibilityValue;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <InputGroup className="lg:max-w-lg">
        <InputGroupInput
          aria-label="Search flashcards"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search flashcards"
          value={query}
        />
        <InputGroupAddon align="inline-end">
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

      <div className="flex flex-wrap gap-2 md:flex-nowrap lg:ml-auto">
        <RadioDropdown<VisibilityValue>
          label={VISIBILITY_LABELS[visibility]}
          onValueChange={onVisibilityChange}
          value={visibility}
          values={[
            ["all", "All visibility"],
            ["PUBLIC", "Public"],
            ["PRIVATE", "Private"],
          ]}
        />

        <RadioDropdown
          label={category === "all" ? "All categories" : category}
          onValueChange={onCategoryChange}
          value={category}
          values={[
            ["all", "All categories"],
            ...categories.map((item) => [item, item] as const),
          ]}
        />

        <RadioDropdown<SortValue>
          label={`Sort: ${SORT_LABELS[sort]}`}
          onValueChange={onSortChange}
          value={sort}
          values={[
            ["latest", "Latest"],
            ["score", "Score"],
            ["terms", "Terms"],
          ]}
        />
      </div>
    </div>
  );
}

function RadioDropdown<TValue extends string>({
  icon: Icon,
  label,
  onValueChange,
  value,
  values,
}: {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onValueChange: (value: TValue) => void;
  value: TValue;
  values: readonly (readonly [TValue, string])[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline">
          {Icon ? <Icon data-icon="inline-start" /> : null}
          {label}
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          onValueChange={(nextValue) => onValueChange(nextValue as TValue)}
          value={value}
        >
          {values.map(([itemValue, itemLabel]) => (
            <DropdownMenuRadioItem
              className="cursor-pointer text-nowrap"
              key={itemValue}
              value={itemValue}
            >
              {itemLabel}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StudySetRow({ author, set }: { author: string; set: FlashcardSet }) {
  return (
    <LibraryItemCard
      action={<StudySetOptionsMenu title={set.title} />}
      icon={
        <HugeiconsIcon
          className="size-5 text-cyan-400"
          icon={Cards01Icon}
          strokeWidth={2}
        />
      }
      itemId={set.id}
      itemType="flashcardset"
      metadata={
        <>
          {set.flashcardCount} cards <span aria-hidden="true">·</span> by{" "}
          {author}
        </>
      }
      title={set.title}
    />
  );
}

function StudySetOptionsMenu({ title }: { title: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Open options for ${title}`}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40 max-w-max">
        <DropdownMenuLabel>Set options</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer text-nowrap">
            <StarIcon />
            favorite
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer text-nowrap">
            <ShareIcon />
            Share
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer text-nowrap"
            variant="destructive"
          >
            <TrashIcon />
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer text-nowrap">
            <FolderIcon />
            Organize
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProfileItemAction({ title }: { title: string }) {
  return (
    <Button
      aria-label={`Open actions for ${title}`}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      <MoreHorizontalIcon />
    </Button>
  );
}

function groupStudySetsBySection(sets: FlashcardSet[]) {
  const groups = new Map<string, FlashcardSet[]>();

  for (const set of sets) {
    const existingSets = groups.get(set.sectionLabel) ?? [];
    existingSets.push(set);
    groups.set(set.sectionLabel, existingSets);
  }

  return Array.from(groups.entries());
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
