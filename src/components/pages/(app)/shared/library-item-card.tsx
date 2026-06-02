import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LibraryItemCardProps {
  action?: ReactNode;
  className?: string;
  description?: string;
  icon: ReactNode;
  metadata: ReactNode;
  title: string;
}

export function LibraryItemCard({
  action,
  className,
  description,
  icon,
  metadata,
  title,
}: LibraryItemCardProps) {
  return (
    <Card
      className={cn(
        "min-w-0 cursor-pointer border bg-transparent py-2 text-foreground shadow-none ring-0 transition-colors hover:bg-muted",
        className
      )}
    >
      <CardContent className="group flex min-w-0 items-center gap-4 px-2">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:border">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-sm leading-5">{title}</h2>
          <p className="font-semibold text-muted-foreground text-sm leading-5">
            {metadata}
          </p>
          {description ? (
            <p className="line-clamp-2 text-muted-foreground text-sm leading-5">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 self-center">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
