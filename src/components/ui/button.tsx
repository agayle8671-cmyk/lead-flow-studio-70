import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(211,100%,45%)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(211,100%,45%)] text-white hover:bg-[hsl(211,100%,50%)]",
        destructive:
          "bg-[hsl(0,100%,62%)] text-white hover:bg-[hsl(0,100%,67%)]",
        success:
          "bg-[hsl(142,69%,50%)] text-white hover:bg-[hsl(142,69%,55%)]",
        warning:
          "bg-[hsl(35,100%,52%)] text-black hover:bg-[hsl(35,100%,57%)]",
        outline:
          "border border-[hsl(0,0%,100%,0.15)] bg-transparent text-[hsl(0,0%,96%)] hover:bg-[hsl(0,0%,100%,0.05)] hover:border-[hsl(0,0%,100%,0.25)]",
        secondary:
          "bg-[hsl(0,0%,14%)] text-[hsl(0,0%,96%)] hover:bg-[hsl(0,0%,18%)]",
        ghost: 
          "text-[hsl(0,0%,96%)] hover:bg-[hsl(0,0%,100%,0.05)]",
        link: 
          "text-[hsl(211,100%,45%)] underline-offset-4 hover:underline",
        // Legacy variants - now simplified
        hero:
          "bg-[hsl(211,100%,45%)] text-white hover:bg-[hsl(211,100%,50%)]",
        glass:
          "bg-[hsl(0,0%,14%)] border border-[hsl(0,0%,100%,0.08)] text-[hsl(0,0%,96%)] hover:bg-[hsl(0,0%,18%)] hover:border-[hsl(0,0%,100%,0.15)]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
