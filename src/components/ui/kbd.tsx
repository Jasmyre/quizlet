import { cn } from "@/lib/utils";

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-5 min-w-5 select-none items-center justify-center rounded border bg-muted px-1 font-medium text-muted-foreground text-xs",
        className
      )}
      {...props}
    />
  );
}

export { Kbd };
