import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-gray-200/80 dark:bg-gray-800/60', className)}
      {...props}
    />
  );
}

export { Skeleton };
