"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListFilter } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function FilterDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilter = (filterName: string) => {
    const currentValue = searchParams.get(filterName);
    const newValue = prompt(
      `Enter value for ${filterName}:`,
      currentValue ?? ""
    );

    const params = new URLSearchParams(searchParams.toString());
    if (newValue) {
      params.set(filterName, newValue);
    } else {
      params.delete(filterName);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const filters = [
    { name: "Country", value: "country" },
    { name: "Device", value: "device" },
    { name: "Referrer", value: "ref" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1">
          <ListFilter className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Filter
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filters.map((filter) => (
          <DropdownMenuItem
            key={filter.value}
            onSelect={() => handleFilter(filter.value)}
          >
            <span className="capitalize">{filter.name}</span>
            {searchParams.get(filter.value) && (
              <span className="ml-auto text-muted-foreground">
                {searchParams.get(filter.value)}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
