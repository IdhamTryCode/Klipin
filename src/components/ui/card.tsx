import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("glass rounded-3xl p-6", className)} {...props} />
));
Card.displayName = "Card";

export const CardStrong = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("glass-strong rounded-3xl p-6", className)}
    {...props}
  />
));
CardStrong.displayName = "CardStrong";
