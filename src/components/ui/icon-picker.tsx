"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { icons } from "lucide-react";

type IconName = keyof typeof icons;

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  defaultValue?: string;
}

export function IconPicker({ value, onChange, defaultValue }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const LucideIcon = value ? icons[value as IconName] : null;

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearch("");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          defaultValue={defaultValue}
        >
          {value ? (
            <div className="flex items-center">
              {LucideIcon && <LucideIcon className="mr-2 h-4 w-4" />}
              {value}
            </div>
          ) : (
            "Select icon"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[400px]">
        <Command>
          <CommandInput
            placeholder="Search icon..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="h-[300px]">
            <CommandEmpty>No icon found.</CommandEmpty>
            <CommandGroup>
              {Object.keys(icons)
                .filter((icon) =>
                  icon.toLowerCase().includes(search.toLowerCase())
                )
                .map((icon) => {
                  const LucideIcon = icons[icon as IconName];
                  return (
                    <CommandItem
                      key={icon}
                      value={icon}
                      onSelect={() => {
                        onChange(icon);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === icon ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <LucideIcon className="mr-2 h-4 w-4" />
                      {icon}
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
