import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-brand-400 to-brand-600 text-white shadow-[0_4px_16px_rgba(255,125,20,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-brand-300 hover:to-brand-500",
        glass: "glass text-fg hover:bg-white/[0.04]",
        ghost: "text-fg-muted hover:text-fg hover:bg-white/[0.04]",
        outline:
          "border border-brand-400/30 text-brand-300 hover:bg-brand-500/10 hover:border-brand-400/60",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
