"use client";

import { forwardRef } from "react";
import { cn } from "./utils";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, checked, defaultChecked, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
      props.onChange?.(e);
    };

    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          className="sr-only peer"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          disabled={props.disabled}
          {...props}
        />
        <div
          data-slot="switch"
          className={cn(
            "peer peer-checked:bg-primary peer-unchecked:bg-switch-background peer-focus-visible:border-ring peer-focus-visible:ring-ring/50 dark:peer-unchecked:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none peer-focus-visible:ring-[3px] peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            className,
          )}
        >
          <div
            data-slot="switch-thumb"
            className="bg-card dark:peer-unchecked:bg-card-foreground dark:peer-checked:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform peer-checked:translate-x-[calc(100%-2px)] peer-unchecked:translate-x-0"
          />
        </div>
      </label>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
