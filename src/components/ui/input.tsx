import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-[hsl(0,0%,100%,0.08)] bg-[hsl(0,0%,11%)] px-4 py-2 text-base text-[hsl(0,0%,96%)]",
          "placeholder:text-[hsl(0,0%,40%)]",
          "transition-colors duration-150",
          "focus:outline-none focus:border-[hsl(211,100%,45%)] focus:ring-1 focus:ring-[hsl(211,100%,45%)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
