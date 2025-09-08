"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Link, MousePointerClick, Search } from "lucide-react";
import { ClicksChart } from "@/components/clicks-chart";
import {
  RecentClicksTable,
  type Click,
} from "@/components/recent-clicks-table";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

const mockClicks: Click[] = [
  {
    id: "1",
    link: { label: "My latest single on Spotify" },
    geo: { country: "USA", city: "New York" },
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    link: { label: "Official Website" },
    geo: { country: "UK", city: "London" },
    timestamp: "5 minutes ago",
  },
  {
    id: "3",
    link: { label: "Follow on Twitter" },
    geo: { country: "Canada", city: "Toronto" },
    timestamp: "10 minutes ago",
  },
  {
    id: "4",
    link: { label: "My latest single on Spotify" },
    geo: { country: "Germany", city: "Berlin" },
    timestamp: "12 minutes ago",
  },
  {
    id: "5",
    link: { label: "Watch on YouTube" },
    geo: { country: "Australia", city: "Sydney" },
    timestamp: "15 minutes ago",
  },
];

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const mockStats = {
    totalClicks: "1,234",
    totalLinks: "12",
    avgClicks: "102.8",
  };

  const filteredClicks = useMemo(() => {
    return mockClicks.filter((click) =>
      click.link.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        A high-level overview of your link performance.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Clicks"
          value={mockStats.totalClicks}
          icon={MousePointerClick}
        />
        <StatCard
          title="Total Links"
          value={mockStats.totalLinks}
          icon={Link}
        />
        <StatCard
          title="Avg. Clicks / Link"
          value={mockStats.avgClicks}
          icon={DollarSign}
        />
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Clicks</CardTitle>
            <CardDescription>
              Your link clicks over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClicksChart />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Clicks</CardTitle>
              <CardDescription>
                A list of the most recent clicks on your links.
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by link label..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <RecentClicksTable clicks={filteredClicks} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
