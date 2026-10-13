import { Skeleton } from "@workspace/ui/components/skeleton"

type PageSkeletonType = { variant: "dashboard" | "list" | "form" }

export const PageSkeleton = ({ variant }: PageSkeletonType) => (
  <div
    className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6"
    aria-busy="true"
    aria-label="Loading"
  >
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-10 w-56" />
    </div>
    {variant === "dashboard" ? (
      <>
        <Skeleton className="h-[6.75rem] rounded-xl" />
        <Skeleton className="h-[20.5rem] rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[29rem] rounded-xl" />
          <Skeleton className="h-[29rem] rounded-xl" />
        </div>
      </>
    ) : variant === "list" ? (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    ) : (
      <div className="flex max-w-xl flex-col gap-4">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )}
  </div>
)
