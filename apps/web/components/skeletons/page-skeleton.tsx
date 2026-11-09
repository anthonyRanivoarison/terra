import { Skeleton } from "@workspace/ui/components/skeleton"

type PageSkeletonType = { variant: "dashboard" | "list" | "form" }

export const PageSkeleton = ({ variant }: PageSkeletonType) => (
  <div
    className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 p-3 md:p-4"
    aria-busy="true"
    aria-label="Loading"
  >
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-72" />
    </div>
    {variant === "dashboard" ? (
      <>
        <Skeleton className="h-[7.25rem] rounded-lg" />
        <Skeleton className="h-[22rem] rounded-lg" />
        <div className="grid gap-3 lg:grid-cols-2">
          <Skeleton className="h-[29rem] rounded-lg" />
          <Skeleton className="h-[29rem] rounded-lg" />
        </div>
      </>
    ) : variant === "list" ? (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    ) : (
      <div className="flex max-w-xl flex-col gap-4">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    )}
  </div>
)
