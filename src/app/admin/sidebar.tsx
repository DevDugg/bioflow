"use client";

import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin",
      label: "Links",
      icon: LinkIcon,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {navItems.map((item) => (
        <Button
          key={item.href}
          asChild
          variant={pathname === item.href ? "secondary" : "ghost"}
          className="w-full justify-start"
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}
