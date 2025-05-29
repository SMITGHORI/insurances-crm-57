
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProfessionalSkeletonProps {
  className?: string;
}

export const TableSkeleton: React.FC<ProfessionalSkeletonProps> = ({ className }) => (
  <div className={cn("animate-pulse", className)}>
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      {/* Table rows */}
      <div className="divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const CardSkeleton: React.FC<ProfessionalSkeletonProps> = ({ className }) => (
  <div className={cn("animate-pulse", className)}>
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      
      <div className="grid grid-cols-1 divide-y divide-gray-100">
        <div className="py-2 space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="py-2 space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="py-2 flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex space-x-1">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const StatsSkeleton: React.FC<ProfessionalSkeletonProps> = ({ className }) => (
  <div className={cn("grid grid-cols-3 gap-2 mb-4", className)}>
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="bg-white shadow-sm rounded-md p-3 border animate-pulse">
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-6 w-12" />
      </div>
    ))}
  </div>
);

export const FiltersSkeleton: React.FC<ProfessionalSkeletonProps> = ({ className }) => (
  <div className={cn("mb-4 space-y-4", className)}>
    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
      <Skeleton className="h-10 w-full sm:flex-1" />
      <Skeleton className="h-10 w-full sm:w-40" />
      <Skeleton className="h-10 w-full sm:w-40" />
      <Skeleton className="h-10 w-full sm:w-20" />
    </div>
  </div>
);

export const TabsSkeleton: React.FC<ProfessionalSkeletonProps> = ({ className }) => (
  <div className={cn("mb-4", className)}>
    <div className="grid grid-cols-4 gap-1 bg-gray-100 rounded-lg p-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-10 rounded-md" />
      ))}
    </div>
  </div>
);

export const PageSkeleton: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => (
  <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 animate-pulse">
    {/* Header */}
    <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-6 gap-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Filters */}
    <FiltersSkeleton />
    
    {/* Stats */}
    <StatsSkeleton />
    
    {/* Tabs */}
    <TabsSkeleton />

    {/* Content */}
    {isMobile ? (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    ) : (
      <TableSkeleton />
    )}
  </div>
);
