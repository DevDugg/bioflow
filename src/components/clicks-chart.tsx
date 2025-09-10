"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ClicksChartProps {
  data: {
    name: string;
    clicks: number;
  }[];
}

export function ClicksChart({ data }: ClicksChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="clicks" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
