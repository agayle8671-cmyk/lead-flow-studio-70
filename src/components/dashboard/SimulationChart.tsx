import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SimulationResult } from "@/hooks/use-simulation";

interface SimulationChartProps {
  simulationData: SimulationResult | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="rounded-lg border bg-card p-3 shadow-lg"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
      }}
    >
      <p className="font-medium text-foreground mb-2">{label}</p>
      <div className="space-y-1">
        {payload[0] && (
          <p className="text-sm">
            <span
              className="inline-block w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: "hsl(160, 84%, 45%)" }}
            />
            Revenue: <span className="font-semibold">${payload[0]?.value?.toLocaleString()}</span>
          </p>
        )}
        {payload[1] && (
          <p className="text-sm">
            <span
              className="inline-block w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: "hsl(200, 80%, 50%)" }}
            />
            Profit: <span className="font-semibold">${payload[1]?.value?.toLocaleString()}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default function SimulationChart({ simulationData }: SimulationChartProps) {
  const chartData = useMemo(() => {
    if (!simulationData) return [];
    
    return simulationData.months.map((month, index) => ({
      month,
      revenue: simulationData.projectedRevenue[index] || 0,
      profit: simulationData.projectedProfit[index] || 0,
    }));
  }, [simulationData]);

  const formatYAxisTick = (v: any) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "";
    const sign = n < 0 ? "-" : "";
    const abs = Math.abs(n);
    if (abs >= 10000) return `${sign}$${Math.round(abs / 1000)}k`;
    return `${sign}$${Math.round(abs).toLocaleString()}`;
  };

  if (!simulationData || chartData.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
        Adjust sliders to see projected outcomes
      </div>
    );
  }

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="simColorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(160, 84%, 45%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(160, 84%, 45%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="simColorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(200, 80%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(200, 80%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={formatYAxisTick}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="natural"
            dataKey="revenue"
            stroke="hsl(160, 84%, 45%)"
            fillOpacity={1}
            fill="url(#simColorRevenue)"
            strokeWidth={2}
            name="Revenue"
          />
          <Area
            type="natural"
            dataKey="profit"
            stroke="hsl(200, 80%, 50%)"
            fillOpacity={1}
            fill="url(#simColorProfit)"
            strokeWidth={2}
            name="Profit"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
