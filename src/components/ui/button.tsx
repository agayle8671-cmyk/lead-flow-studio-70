import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 ease-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0099FF] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Azure Radiance Primary
        default:
          "bg-[#0099FF] text-white hover:bg-[#00AAFF] shadow-[0_0_20px_rgba(0,153,255,0.3)] hover:shadow-[0_0_30px_rgba(0,153,255,0.4)]",
        // Alizarin Crimson Destructive
        destructive:
          "bg-[#DC2626] text-white hover:bg-[#EF4444] shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]",
        success:
          "bg-[#22C55E] text-white hover:bg-[#4ADE80] shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]",
        warning:
          "bg-[#F59E0B] text-black hover:bg-[#FBBF24] shadow-[0_0_20px_rgba(245,158,11,0.3)]",
        // Glassmorphism outline
        outline:
          "border border-white/[0.15] bg-transparent text-white hover:bg-white/[0.05] hover:border-white/[0.25] backdrop-blur-sm",
        // Glass secondary
        secondary:
          "bg-white/[0.08] backdrop-blur-xl border border-white/[0.08] text-white hover:bg-white/[0.12] hover:border-white/[0.15]",
        ghost: 
          "text-white/80 hover:text-white hover:bg-white/[0.05]",
        link: 
          "text-[#0099FF] underline-offset-4 hover:underline",
        // Glass card style
        glass:
          "bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] text-white hover:bg-white/[0.1] hover:border-white/[0.15]",
        // Hero - azure with stronger glow
        hero:
          "bg-[#0099FF] text-white hover:bg-[#00AAFF] shadow-[0_0_30px_rgba(0,153,255,0.4)] hover:shadow-[0_0_40px_rgba(0,153,255,0.5)]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
        xl: "h-12 rounded-xl px-10 text-base font-semibold",
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
