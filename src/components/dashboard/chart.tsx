'use client';

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart, Pie, PieChart, Cell } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface TimeSeriesData {
  date: string;
  count: number;
}

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PostsOverTimeChartProps {
  data: TimeSeriesData[];
}

export function PostsOverTimeChart({ data }: PostsOverTimeChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#8884d8" 
            activeDot={{ r: 8 }} 
            name="Posts"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ReportsByStatusChartProps {
  data: PieChartData[];
}

export function ReportsByStatusChart({ data }: ReportsByStatusChartProps) {
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface StatCardChartProps {
  data: ChartData[];
}

export function StatCardChart({ data }: StatCardChartProps) {
  return (
    <div className="h-20">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}