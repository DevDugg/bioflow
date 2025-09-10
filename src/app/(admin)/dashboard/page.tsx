import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Link, MousePointerClick } from "lucide-react";
import { ClicksChart } from "@/components/clicks-chart";
import { RecentClicksTable } from "@/components/recent-clicks-table";
import {
  getClicksChartData,
  getDashboardStats,
  getRecentClicks,
} from "@/server/analytics";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";

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

async function DashboardStats() {
  const stats = await getDashboardStats();
  return (
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
  );
}

async function ClicksChartData() {
  const chartData = await getClicksChartData();
  return <ClicksChart data={chartData} />;
}

async function RecentClicks() {
  const recentClicks = await getRecentClicks();
  return <RecentClicksTable clicks={recentClicks} />;
}

export default async function DashboardPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        A high-level overview of your link performance.
      </p>

      <Suspense
        fallback={
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        }
      >
        <DashboardStats />
      </Suspense>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Clicks</CardTitle>
            <CardDescription>
              Your link clicks over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[300px]" />}>
              <ClicksChartData />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Clicks</CardTitle>
            <CardDescription>
              A list of the most recent clicks on your links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<TableSkeleton columns={3} />}>
              <RecentClicks />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
