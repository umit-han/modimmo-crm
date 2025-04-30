"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SearchableSelectOption = {
  value: string;
  label: string;
  description?: string;
};

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  popoverWidth?: string;
  maxHeight?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  disabled = false,
  clearable = false,
  className,
  popoverWidth = "w-[300px]",
  maxHeight = "max-h-[300px]",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((option) => option.value === value);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <div className="flex items-center justify-between w-full overflow-hidden">
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <div className="flex items-center">
              {clearable && value && (
                <X
                  className="h-4 w-4 opacity-50 hover:opacity-100 mr-1"
                  onClick={handleClear}
                />
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", popoverWidth)}>
        <Command>
          <div className="flex items-center border-b px-3">
            <CommandInput
              placeholder="Search..."
              className="flex-1 h-9 border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <CommandList className={maxHeight}>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{option.label}</span>
                    </div>
                    {option.description && (
                      <span className="text-xs text-muted-foreground truncate ml-6">
                        {option.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Form-specific version that integrates with React Hook Form
interface FormSearchableSelectProps
  extends Omit<SearchableSelectProps, "value" | "onValueChange"> {
  name: string;
  control: any;
  rules?: any;
  label?: string;
  description?: string;
}

export function FormSearchableSelect({
  name,
  control,
  rules,
  label,
  description,
  ...props
}: FormSearchableSelectProps) {
  return (
    <div className="grid gap-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <control.field
        name={name}
        control={control}
        rules={rules}
        render={({ field }: { field: any }) => (
          <SearchableSelect
            {...props}
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />
    </div>
  );
}
