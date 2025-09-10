import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Link, MousePointerClick, Search } from "lucide-react";
import { ClicksChart } from "@/components/clicks-chart";
import { RecentClicksTable } from "@/components/recent-clicks-table";
import { Input } from "@/components/ui/input";
import {
  getClicksChartData,
  getDashboardStats,
  getRecentClicks,
} from "@/server/analytics";

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

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const recentClicks = await getRecentClicks();
  const chartData = await getClicksChartData();

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        A high-level overview of your link performance.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Clicks"
          value={stats.totalClicks}
          icon={MousePointerClick}
        />
        <StatCard title="Total Links" value={stats.totalLinks} icon={Link} />
        <StatCard
          title="Avg. Clicks / Link"
          value={stats.avgClicks}
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
            <ClicksChart data={chartData} />
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
              <Input placeholder="Search by link label..." className="pl-8" />
            </div>
          </CardHeader>
          <CardContent>
            <RecentClicksTable clicks={recentClicks} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
