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

const data = [
  { name: "Mon", clicks: 400 },
  { name: "Tue", clicks: 300 },
  { name: "Wed", clicks: 200 },
  { name: "Thu", clicks: 278 },
  { name: "Fri", clicks: 189 },
  { name: "Sat", clicks: 239 },
  { name: "Sun", clicks: 349 },
];

export function ClicksChart() {
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
