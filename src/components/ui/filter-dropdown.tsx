"use client";

import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { getFilterValues } from "@/server/analytics";

type FilterValues = Awaited<ReturnType<typeof getFilterValues>>;

export function FilterDropdown({
  filterValues,
}: {
  filterValues: FilterValues;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [country, setCountry] = useState(searchParams.get("country") ?? "");
  const [device, setDevice] = useState(searchParams.get("device") ?? "");
  const [ref, setRef] = useState(searchParams.get("ref") ?? "");

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (country) params.set("country", country);
    else params.delete("country");
    if (device) params.set("device", device);
    else params.delete("device");
    if (ref) params.set("ref", ref);
    else params.delete("ref");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    setCountry("");
    setDevice("");
    setRef("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("country");
    params.delete("device");
    params.delete("ref");
    router.replace(`${pathname}?${params.toString()}`);
  };

  if ("errors" in filterValues) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1">
          <ListFilter className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Filter
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-4" align="end">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Filters</h4>
          <p className="text-sm text-muted-foreground">
            Filter the analytics data by specific properties.
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {filterValues.countries.map((c: string) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="device">Device</Label>
            <Select value={device} onValueChange={setDevice}>
              <SelectTrigger>
                <SelectValue placeholder="Select a device" />
              </SelectTrigger>
              <SelectContent>
                {filterValues.devices.map((d: string) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ref">Referrer</Label>
            <Select value={ref} onValueChange={setRef}>
              <SelectTrigger>
                <SelectValue placeholder="Select a referrer" />
              </SelectTrigger>
              <SelectContent>
                {filterValues.refs.map((r: string) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
