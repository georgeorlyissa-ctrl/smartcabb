import * as React from "react";
import { MagnifyingGlassIcon } from "../../lib/icons";
import { cn } from "./utils";

// Simplified command without cmdk
interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

function Command({
  className,
  children,
  value,
  onValueChange,
  ...props
}: CommandProps) {
  const [searchValue, setSearchValue] = React.useState(value || "");

  const handleValueChange = (newValue: string) => {
    setSearchValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className
      )}
      data-value={searchValue}
      {...props}
    >
      <CommandContext.Provider value={{ searchValue, setSearchValue: handleValueChange }}>
        {children}
      </CommandContext.Provider>
    </div>
  );
}

const CommandContext = React.createContext<{
  searchValue: string;
  setSearchValue: (value: string) => void;
}>({
  searchValue: "",
  setSearchValue: () => {},
});

function CommandDialog({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { open?: boolean }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50"
      {...props}
    >
      <div className="fixed left-[50%] top-[50%] max-h-[85vh] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-background p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </div>
    </div>
  );
}

function CommandInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const { searchValue, setSearchValue } = React.useContext(CommandContext);

  return (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      <MagnifyingGlassIcon className="mr-2 size-4 shrink-0 opacity-50" />
      <input
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CommandEmpty({
  className,
  children = "No results found.",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { searchValue } = React.useContext(CommandContext);

  // Only show if there's a search value
  if (!searchValue) return null;

  return (
    <div
      className={cn("py-6 text-center text-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CommandGroup({
  className,
  children,
  heading,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { heading?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        className
      )}
      cmdk-group=""
      {...props}
    >
      {heading && <div cmdk-group-heading="">{heading}</div>}
      {children}
    </div>
  );
}

function CommandSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  children,
  onSelect,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  onSelect?: (value: string) => void;
}) {
  const handleClick = () => {
    onSelect?.(String(children));
  };

  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      cmdk-item=""
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
}

function CommandShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
};
