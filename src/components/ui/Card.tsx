import { cn } from "@/utils/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-full max-w-md bg-card shadow-md rounded-2xl p-8",
        className
      )}
      {...props}
    />
  );
}
