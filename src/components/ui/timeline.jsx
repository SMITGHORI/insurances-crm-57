
import * as React from "react"
import { cn } from "@/lib/utils"

const Timeline = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      {...props}
    />
  )
})
Timeline.displayName = "Timeline"

const TimelineItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex mb-6 last:mb-0", className)}
      {...props}
    />
  )
})
TimelineItem.displayName = "TimelineItem"

const TimelineSeparator = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col items-center", className)}
      {...props}
    />
  )
})
TimelineSeparator.displayName = "TimelineSeparator"

const TimelineDot = React.forwardRef(({ className, variant = "filled", color = "primary", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border-4 border-white z-10",
        className
      )}
      {...props}
    />
  )
})
TimelineDot.displayName = "TimelineDot"

const TimelineConnector = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("w-0.5 h-full bg-gray-200 mx-auto", className)}
      {...props}
    />
  )
})
TimelineConnector.displayName = "TimelineConnector"

const TimelineContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex-1", className)}
      {...props}
    />
  )
})
TimelineContent.displayName = "TimelineContent"

export {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent
}
