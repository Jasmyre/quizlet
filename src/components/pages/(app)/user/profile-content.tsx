"use client";

import {
  BookmarkIcon,
  BookOpenIcon,
  CalendarIcon,
  ChevronDownIcon,
  CopyIcon,
  FlagIcon,
  FolderIcon,
  MessageSquareWarningIcon,
  MoreHorizontalIcon,
  PlayIcon,
  SearchIcon,
  ShareIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { UserProfile } from "@/schemas/user-profile-schema";

type StudySet = UserProfile["studySets"][number];
type FilterValue = "all" | "recent" | "high-score" | "needs-practice";
type SortValue = "latest" | "score" | "terms";
type VisibilityValue = "all" | StudySet["visibility"];
type ViewMode = "list" | "grid";

const SORT_LABELS: Record<SortValue, string> = {
  latest: "Latest",
  score: "Score",
  terms: "Terms",
};

const VISIBILITY_LABELS: Record<VisibilityValue, string> = {
  all: "All visibility",
  private: "Private",
  public: "Public",
  unlisted: "Unlisted",
};

export function ProfileContent({ profile }: { profile: UserProfile }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [subject, setSubject] = useState("all");
  const [visibility, setVisibility] = useState<VisibilityValue>("all");
  const [sort, setSort] = useState<SortValue>("latest");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const subjects = useMemo(
    () => Array.from(new Set(profile.studySets.map((set) => set.subject))),
    [profile.studySets]
  );

  const visibleStudySets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return profile.studySets
      .filter((set) => {
        const matchesSearch =
          normalizedQuery.length === 0 ||
          set.title.toLowerCase().includes(normalizedQuery) ||
          set.subject.toLowerCase().includes(normalizedQuery);
        const matchesSubject = subject === "all" || set.subject === subject;
        const matchesVisibility =
          visibility === "all" || set.visibility === visibility;
        const matchesFilter =
          filter === "all" ||
          (filter === "recent" && set.sectionLabel === "This month") ||
          (filter === "high-score" && set.avgScore >= 80) ||
          (filter === "needs-practice" && set.avgScore < 75);

        return (
          matchesSearch && matchesSubject && matchesVisibility && matchesFilter
        );
      })
      .sort((firstSet, secondSet) => {
        if (sort === "score") {
          return secondSet.avgScore - firstSet.avgScore;
        }

        if (sort === "terms") {
          return secondSet.terms - firstSet.terms;
        }

        return secondSet.studiedAtOrder - firstSet.studiedAtOrder;
      });
  }, [filter, profile.studySets, query, sort, subject, visibility]);

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
            <TabsTrigger value="practice-tests">Practice tests</TabsTrigger>
            <TabsTrigger value="study-guides">Study guides</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="flex flex-col gap-6" value="flashcard-sets">
          <StudySetToolbar
            filter={filter}
            onFilterChange={setFilter}
            onQueryChange={setQuery}
            onSortChange={setSort}
            onSubjectChange={setSubject}
            onViewModeChange={setViewMode}
            onVisibilityChange={setVisibility}
            query={query}
            sort={sort}
            subject={subject}
            subjects={subjects}
            viewMode={viewMode}
            visibility={visibility}
          />

          <div
            className={
              viewMode === "grid"
                ? "grid min-w-0 gap-3 lg:grid-cols-2"
                : "flex min-w-0 flex-col gap-5"
            }
          >
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
                <div className="flex min-w-0 flex-col gap-4">
                  {sets.map((set) => (
                    <StudySetRow key={set.id} set={set} />
                  ))}
                </div>
              </section>
            ))}

            {visibleStudySets.length === 0 && (
              <Card size="sm">
                <CardHeader>
                  <CardTitle>No flashcard sets found</CardTitle>
                  <CardDescription>
                    Try a different search term or clear one of the filters.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent className="grid gap-3 sm:grid-cols-2" value="classes">
          {profile.classes.map((classroom) => (
            <LibraryCard
              description={`${classroom.memberCount} members · ${classroom.setCount} sets`}
              icon={UsersIcon}
              key={classroom.id}
              title={classroom.name}
            />
          ))}
        </TabsContent>

        <TabsContent className="grid gap-3 sm:grid-cols-2" value="folders">
          {profile.folders.map((folder) => (
            <LibraryCard
              description={`${folder.setCount} sets`}
              icon={FolderIcon}
              key={folder.id}
              title={folder.name}
            />
          ))}
        </TabsContent>

        <TabsContent
          className="grid gap-3 sm:grid-cols-2"
          value="practice-tests"
        >
          {profile.practiceTests.map((test) => (
            <LibraryCard
              description={`${test.questionCount} questions · ${test.lastAttempt}`}
              icon={BookOpenIcon}
              key={test.id}
              title={test.title}
            />
          ))}
        </TabsContent>

        <TabsContent className="grid gap-3 sm:grid-cols-2" value="study-guides">
          {profile.studyGuides.map((guide) => (
            <LibraryCard
              description={`${guide.pageCount} pages · ${guide.updatedAt}`}
              icon={BookOpenIcon}
              key={guide.id}
              title={guide.title}
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
            <Avatar className="size-32" size="default">
              <AvatarImage alt={profile.name} src={profile.avatarUrl} />
              <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
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
  onQueryChange,
  onSortChange,
  onVisibilityChange,
  query,
  sort,
  visibility,
}: {
  filter: FilterValue;
  onFilterChange: (value: FilterValue) => void;
  onQueryChange: (value: string) => void;
  onSortChange: (value: SortValue) => void;
  onSubjectChange: (value: string) => void;
  onViewModeChange: (value: ViewMode) => void;
  onVisibilityChange: (value: VisibilityValue) => void;
  query: string;
  sort: SortValue;
  subject: string;
  subjects: string[];
  viewMode: ViewMode;
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

      <div className="flex flex-nowrap gap-2 lg:ml-auto">
        <RadioDropdown<VisibilityValue>
          label={VISIBILITY_LABELS[visibility]}
          onValueChange={onVisibilityChange}
          value={visibility}
          values={[
            ["all", "All visibility"],
            ["public", "Public"],
            ["private", "Private"],
            ["unlisted", "Unlisted"],
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

function StudySetRow({ set }: { set: StudySet }) {
  return (
    <Card className="min-w-0 transition-colors hover:bg-muted/50" size="sm">
      <CardContent className="flex min-w-0 flex-row justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-muted-foreground text-xs">
            {set.terms} Terms
          </p>
          <h3 className="mb-4 truncate font-heading font-semibold text-base">
            {set.title}
          </h3>
          <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <FolderIcon />
            {set.subject}
          </p>
        </div>
        <div className="md:self-start">
          <StudySetActionMenu title={set.title} />
        </div>
      </CardContent>
    </Card>
  );
}

function StudySetActionMenu({ title }: { title: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Open actions for ${title}`}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Set actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BookOpenIcon />
            Open set
          </DropdownMenuItem>
          <DropdownMenuItem>
            <PlayIcon />
            Practice
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BookmarkIcon />
            Save to folder
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <ShareIcon />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FlagIcon />
            Report
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LibraryCard({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Button
            aria-label={`Open actions for ${title}`}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <MoreHorizontalIcon />
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  );
}

function groupStudySetsBySection(sets: StudySet[]) {
  const groups = new Map<string, StudySet[]>();

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
    .map((part) => part.at(0))
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
