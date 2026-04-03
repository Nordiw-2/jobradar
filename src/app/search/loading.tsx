import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSearch() {
  return (
    <div className="grid gap-4 md:grid-cols-[280px,1fr]">
      <div className="surface hidden space-y-3 p-4 md:block">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface space-y-3 p-5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
