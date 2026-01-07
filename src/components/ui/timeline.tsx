import * as React from "react"
import { cn } from "@/lib/utils"

const Timeline = React.forwardRef<
  HTMLOListElement,
  React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn("border-l border-muted-foreground/30 ml-3 space-y-10", className)}
    {...props}
  />
))
Timeline.displayName = "Timeline"

const TimelineItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("relative pl-8", className)}
    {...props}
  />
))
TimelineItem.displayName = "TimelineItem"

const TimelineDot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  // The dot needs to rely on the parent (li) relative positioning
  // -left-[4.5px] centers a 9px dot on a 1px border.
  // We'll use w-3 h-3 (12px) for a slightly larger dot, so -left-[6.5px] approx or strict calculation.
  // Actually, let's use standard sizing.
  // The border is 1px.
  // If we want the dot centered on the border line (which is at left: 0 of the ol, effectively?)
  // Wait, the OL has border-l.
  // So the line is at the left edge of the OL.
  // The LI is inside the OL.
  // WE need to position the dot relative to the line.
  // The line is at -1px relative to LI content if we just have PL?
  // Let's rely on absolute positioning relative to the LI which has pl-8.
  // But the LI includes the padding.
  // The border is on the OL.
  // So the line is at the far left of the component.
  // So standard absolute positioning: left-[-5px] (if dot is w-2.5) relative to the OL? No, relative to LI?
  // Best bet: Put the dot absolute -left-[Something] relative to the LI content?
  // Actually, easiest is:
  // OL has border-l.
  // LI has content.
  // Dot is absolute inside LI, constrained to left edge.
  // Since OL border is at 0px.
  // We want the dot center at 0px.
  // If dot is w-3 (12px), left should be -6px.
  // BUT the border is usually inclusive or exclusive depending on box model.
  // Let's just try left-[-6.5px] to account for 1px border width if needed, or just -6px.
  <div
    ref={ref}
    className={cn(
      "absolute -left-[6.5px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background",
      className
    )}
    {...props}
  />
))
TimelineDot.displayName = "TimelineDot"

const TimelineTime = React.forwardRef<
  HTMLTimeElement,
  React.TimeHTMLAttributes<HTMLTimeElement>
>(({ className, ...props }, ref) => (
  <time
    ref={ref}
    className={cn(
      "mb-1 block text-sm leading-none text-muted-foreground/80",
      className
    )}
    {...props}
  />
))
TimelineTime.displayName = "TimelineTime"

const TimelineHeading = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("mb-2 text-lg font-semibold tracking-tight text-foreground/90", className)}
    {...props}
  />
))
TimelineHeading.displayName = "TimelineHeading"

const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-base text-muted-foreground", className)}
    {...props}
  />
))
TimelineDescription.displayName = "TimelineDescription"

export {
  Timeline,
  TimelineItem,
  TimelineDot,
  TimelineTime,
  TimelineHeading,
  TimelineDescription,
}
