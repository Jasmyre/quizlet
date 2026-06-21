"use client";

import { Cards01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpenIcon,
  ChevronDownIcon,
  FolderIcon,
  GraduationCapIcon,
  MoreHorizontalIcon,
  SearchIcon,
  ShareIcon,
  StarIcon,
  TrashIcon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useMemo, useState } from "react";
import { deleteFlashcardSet } from "@/actions/flashcardset";
import { LibraryItemCard } from "@/components/pages/(app)/shared/library-item-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import type { UserLibrary } from "@/schemas/user-library-schema";

type FlashcardSet = UserLibrary["flashcardSets"][number];
type Folder = UserLibrary["folders"][number];
type Classroom = UserLibrary["classes"][number];
type LibraryTab = "sets" | "folders" | "classes";
type SetSort = "latest" | "title" | "terms";
type FolderSort = "latest" | "title" | "sets";
type ClassSort = "latest" | "title" | "members" | "sets";
type VisibilityValue = "all" | FlashcardSet["visibility"];

const SET_SORT_LABELS = {
  latest: "Latest",
  terms: "Term count",
  title: "Title",
} as const satisfies Record<SetSort, string>;

const FOLDER_SORT_LABELS = {
  latest: "Latest",
  sets: "Set count",
  title: "Name",
} as const satisfies Record<FolderSort, string>;

const CLASS_SORT_LABELS = {
  latest: "Latest",
  members: "Members",
  sets: "Set count",
  title: "Name",
} as const satisfies Record<ClassSort, string>;

const VISIBILITY_LABELS = {
  all: "All visibility",
  ...flashcardSetVisibilityLabels,
} as const satisfies Record<VisibilityValue, string>;

export function LibraryContent({ library }: { library: UserLibrary }) {
  const [activeTab, setActiveTab] = useState<LibraryTab>("sets");
  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState<VisibilityValue>("all");
  const [setSort, setSetSort] = useState<SetSort>("latest");
  const [folderSort, setFolderSort] = useState<FolderSort>("latest");
  const [classSort, setClassSort] = useState<ClassSort>("latest");

  const normalizedQuery = query.trim().toLowerCase();

  const visibleSets = useMemo(
    () =>
      [...library.flashcardSets]
        .filter((set) => {
          const description = set.description ?? "";
          const matchesSearch =
            normalizedQuery.length === 0 ||
            set.title.toLowerCase().includes(normalizedQuery) ||
            description.toLowerCase().includes(normalizedQuery);
          const matchesVisibility =
            visibility === "all" || set.visibility === visibility;

          return matchesSearch && matchesVisibility;
        })
        .sort((firstSet, secondSet) => {
          if (setSort === "title") {
            return firstSet.title.localeCompare(secondSet.title);
          }

          if (setSort === "terms") {
            return secondSet.flashcardCount - firstSet.flashcardCount;
          }

          return (
            new Date(secondSet.updatedAt).getTime() -
            new Date(firstSet.updatedAt).getTime()
          );
        }),
    [library.flashcardSets, normalizedQuery, setSort, visibility]
  );

  const visibleFolders = useMemo(
    () =>
      [...library.folders]
        .filter((folder) => matchesNamedItem(folder, normalizedQuery))
        .sort((firstFolder, secondFolder) => {
          if (folderSort === "title") {
            return firstFolder.name.localeCompare(secondFolder.name);
          }

          if (folderSort === "sets") {
            return secondFolder.setCount - firstFolder.setCount;
          }

          return (
            new Date(secondFolder.updatedAt).getTime() -
            new Date(firstFolder.updatedAt).getTime()
          );
        }),
    [folderSort, library.folders, normalizedQuery]
  );

  const visibleClasses = useMemo(
    () =>
      [...library.classes]
        .filter((classroom) => matchesNamedItem(classroom, normalizedQuery))
        .sort((firstClass, secondClass) => {
          if (classSort === "title") {
            return firstClass.name.localeCompare(secondClass.name);
          }

          if (classSort === "members") {
            return secondClass.memberCount - firstClass.memberCount;
          }

          if (classSort === "sets") {
            return secondClass.setCount - firstClass.setCount;
          }

          return (
            new Date(secondClass.updatedAt).getTime() -
            new Date(firstClass.updatedAt).getTime()
          );
        }),
    [classSort, library.classes, normalizedQuery]
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 px-4 pb-10">
      <LibraryHeader library={library} />

      <Tabs
        className="gap-6"
        onValueChange={(value) => setActiveTab(value as LibraryTab)}
        value={activeTab}
      >
        <div className="overflow-x-auto">
          <TabsList className="min-w-max" variant="line">
            <TabsTrigger value="sets">Flashcard sets</TabsTrigger>
            <TabsTrigger value="folders">Folders</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
          </TabsList>
        </div>

        <LibraryToolbar
          activeTab={activeTab}
          classSort={classSort}
          folderSort={folderSort}
          onClassSortChange={setClassSort}
          onFolderSortChange={setFolderSort}
          onQueryChange={setQuery}
          onSetSortChange={setSetSort}
          onVisibilityChange={setVisibility}
          query={query}
          setSort={setSort}
          visibility={visibility}
        />

        <TabsContent className="flex flex-col gap-4" value="sets">
          <ResultSummary count={visibleSets.length} label="flashcard sets" />
          {visibleSets.length > 0 ? (
            <div className="grid min-w-0 gap-x-4 gap-y-5 lg:grid-cols-1">
              {visibleSets.map((set) => (
                <FlashcardSetCard
                  author={library.user.username}
                  key={set.id}
                  set={set}
                />
              ))}
            </div>
          ) : (
            <LibraryEmptyState
              description="Try a different search term or visibility filter."
              icon={BookOpenIcon}
              title="No flashcard sets found"
            />
          )}
        </TabsContent>

        <TabsContent className="flex flex-col gap-4" value="folders">
          <ResultSummary count={visibleFolders.length} label="folders" />
          {visibleFolders.length > 0 ? (
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              {visibleFolders.map((folder) => (
                <FolderCard folder={folder} key={folder.id} />
              ))}
            </div>
          ) : (
            <LibraryEmptyState
              description="Folders you create or join to sets will appear here."
              icon={FolderIcon}
              title="No folders found"
            />
          )}
        </TabsContent>

        <TabsContent className="flex flex-col gap-4" value="classes">
          <ResultSummary count={visibleClasses.length} label="classes" />
          {visibleClasses.length > 0 ? (
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              {visibleClasses.map((classroom) => (
                <ClassCard classroom={classroom} key={classroom.id} />
              ))}
            </div>
          ) : (
            <LibraryEmptyState
              description="Classes you own or belong to will appear here."
              icon={GraduationCapIcon}
              title="No classes found"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LibraryHeader({ library }: { library: UserLibrary }) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex min-w-0 flex-row items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-heading font-semibold text-2xl tracking-normal">
            Your library
          </h1>
          <p className="text-muted-foreground text-sm">
            Study sets, folders, and classes saved for {library.user.username}.
          </p>
        </div>
      </div>
      <Separator />
    </section>
  );
}

function LibraryToolbar({
  activeTab,
  classSort,
  folderSort,
  onClassSortChange,
  onFolderSortChange,
  onQueryChange,
  onSetSortChange,
  onVisibilityChange,
  query,
  setSort,
  visibility,
}: {
  activeTab: LibraryTab;
  classSort: ClassSort;
  folderSort: FolderSort;
  onClassSortChange: (value: ClassSort) => void;
  onFolderSortChange: (value: FolderSort) => void;
  onQueryChange: (value: string) => void;
  onSetSortChange: (value: SetSort) => void;
  onVisibilityChange: (value: VisibilityValue) => void;
  query: string;
  setSort: SetSort;
  visibility: VisibilityValue;
}) {
  const searchPlaceholder =
    activeTab === "sets" ? "Search flashcard sets" : `Search ${activeTab}`;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <InputGroup className="lg:max-w-lg">
        <InputGroupInput
          aria-label={searchPlaceholder}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
          value={query}
        />
        <InputGroupAddon align="inline-end">
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

      <div className="flex flex-wrap gap-2 md:flex-nowrap lg:ml-auto">
        {activeTab === "sets" ? (
          <>
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
            <RadioDropdown<SetSort>
              label={`Sort: ${SET_SORT_LABELS[setSort]}`}
              onValueChange={onSetSortChange}
              value={setSort}
              values={[
                ["latest", "Latest"],
                ["title", "Title"],
                ["terms", "Term count"],
              ]}
            />
          </>
        ) : null}

        {activeTab === "folders" ? (
          <RadioDropdown<FolderSort>
            label={`Sort: ${FOLDER_SORT_LABELS[folderSort]}`}
            onValueChange={onFolderSortChange}
            value={folderSort}
            values={[
              ["latest", "Latest"],
              ["title", "Name"],
              ["sets", "Set count"],
            ]}
          />
        ) : null}

        {activeTab === "classes" ? (
          <RadioDropdown<ClassSort>
            label={`Sort: ${CLASS_SORT_LABELS[classSort]}`}
            onValueChange={onClassSortChange}
            value={classSort}
            values={[
              ["latest", "Latest"],
              ["title", "Name"],
              ["members", "Members"],
              ["sets", "Set count"],
            ]}
          />
        ) : null}
      </div>
    </div>
  );
}

function RadioDropdown<TValue extends string>({
  label,
  onValueChange,
  value,
  values,
}: {
  label: string;
  onValueChange: (value: TValue) => void;
  value: TValue;
  values: readonly (readonly [TValue, string])[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline">
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

function FlashcardSetCard({
  author,
  set,
}: {
  author: string;
  set: FlashcardSet;
}) {
  return (
    <LibraryItemCard
      action={
        <LibraryItemMenu
          label={set.title}
          onDelete={() => deleteFlashcardSet(set.id)}
        />
      }
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

function FolderCard({ folder }: { folder: Folder }) {
  return (
    <LibraryItemCard
      action={<LibraryItemMenu label={folder.name} />}
      description={folder.description ?? "No description"}
      icon={<FolderIcon className="size-5 text-amber-400" />}
      itemId={folder.id}
      itemType="folder"
      metadata={`${folder.setCount} sets`}
      title={folder.name}
    />
  );
}

function ClassCard({ classroom }: { classroom: Classroom }) {
  return (
    <LibraryItemCard
      action={<LibraryItemMenu label={classroom.name} />}
      description={
        classroom.description ?? `${capitalize(classroom.role)} class`
      }
      icon={<GraduationCapIcon className="size-5 text-emerald-400" />}
      itemId={classroom.id}
      itemType="classroom"
      metadata={
        <>
          {classroom.memberCount} members · {classroom.setCount} sets
        </>
      }
      title={classroom.name}
    />
  );
}

function LibraryItemMenu({
  label,
  onDelete,
}: {
  label: string;
  onDelete?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Open actions for ${label}`}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40 max-w-max">
        <DropdownMenuLabel>Item options</DropdownMenuLabel>
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
            onClick={onDelete}
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

function ResultSummary({ count, label }: { count: number; label: string }) {
  return (
    <p className="text-muted-foreground text-sm">
      Showing {count} {label}
    </p>
  );
}

function LibraryEmptyState({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
}) {
  return (
    <Card className="min-w-0 border-dashed" size="sm">
      <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon />
        </div>
        <div className="flex max-w-sm flex-col gap-1">
          <h2 className="font-heading font-semibold text-base">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function matchesNamedItem(
  item: Pick<Folder | Classroom, "description" | "name">,
  normalizedQuery: string
) {
  const description = item.description ?? "";

  return (
    normalizedQuery.length === 0 ||
    item.name.toLowerCase().includes(normalizedQuery) ||
    description.toLowerCase().includes(normalizedQuery)
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
