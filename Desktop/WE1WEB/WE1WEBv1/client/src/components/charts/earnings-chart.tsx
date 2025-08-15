import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function EarningsChart() {
  // Generate mock data for the last 30 days
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate realistic earnings data with some variation
      const baseEarning = 50 + Math.random() * 100;
      const weekendMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 1.3 : 1;
      const earnings = baseEarning * weekendMultiplier;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        earnings: Math.round(earnings * 100) / 100,
        cumulative: data.length > 0 ? 
          data[data.length - 1].cumulative + earnings : 
          earnings,
      });
    }
    
    return data;
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-accent">
            Earnings: ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="earnings" 
            stroke="hsl(217, 91%, 60%)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(217, 91%, 60%)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
