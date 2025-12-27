import { useMemo } from "react";
import { format } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useForecast, ForecastDataPoint } from "@/hooks/use-forecast";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const formatDateLabel = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return value;
  return format(d, "MMM");
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload as ForecastDataPoint;
  const isForecast = dataPoint?.isForecast;

  return (
    <div
      className="rounded-lg border bg-card p-3 shadow-lg"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
      }}
    >
      <p className="font-medium text-foreground mb-2">{formatDateLabel(label)}</p>
      {isForecast && (
        <p className="text-xs text-primary mb-2 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
          AI Projection based on current growth trends
        </p>
      )}
      <div className="space-y-1">
        <p className="text-sm">
          <span
            className="inline-block w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: "hsl(160, 84%, 45%)" }}
          />
          Revenue: <span className="font-semibold">${payload[0]?.value?.toLocaleString()}</span>
        </p>
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

export default function ForecastChart() {
  const { combinedData, forecastData, isLoading, hasNegativeForecast } = useForecast();
  
  // Dynamic profit forecast color based on whether it goes negative
  const profitForecastColor = hasNegativeForecast ? "hsl(0, 84%, 60%)" : "hsl(200, 80%, 50%)";

  const formatYAxisTick = (v: any) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "";

    const sign = n < 0 ? "-" : "";
    const abs = Math.abs(n);

    if (abs >= 10000) return `${sign}$${Math.round(abs / 1000)}k`;
    return `${sign}$${Math.round(abs).toLocaleString()}`;
  };

  const lastHistoricalDate = useMemo(() => {
    let last: string | undefined;
    for (const p of combinedData) {
      if (!p.isForecast) last = p.date;
    }
    return last;
  }, [combinedData]);

  const chartData = useMemo(() => {
    return combinedData.map((point) => {
      const isBridgePoint =
        !point.isForecast && !!lastHistoricalDate && point.date === lastHistoricalDate;

      return {
        ...point,
        // Historical values (solid lines)
        revenueHistorical: point.isForecast ? null : point.revenue,
        profitHistorical: point.isForecast ? null : point.profit,
        // Forecast values (dashed lines) - bridge from last historical point
        revenueForecast: point.isForecast || isBridgePoint ? point.revenue : null,
        profitForecast: point.isForecast || isBridgePoint ? point.profit : null,
      };
    });
  }, [combinedData, lastHistoricalDate]);

  const formatXAxisTick = (v: any) => formatDateLabel(String(v));

  if (isLoading) {
    return <Skeleton className="w-full h-[280px] rounded-lg" />;
  }

  if (forecastData.length === 0) {
    console.warn("No forecast data available");
  }

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRevenueHistorical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(160, 84%, 45%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(160, 84%, 45%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorProfitHistorical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(200, 80%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(200, 80%, 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRevenueForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(160, 84%, 45%)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(160, 84%, 45%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorProfitForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={profitForecastColor} stopOpacity={0.15} />
              <stop offset="95%" stopColor={profitForecastColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={formatXAxisTick}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={formatYAxisTick}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Reference line showing where forecast begins */}
          {lastHistoricalDate && (
            <ReferenceLine
              x={lastHistoricalDate}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{
                value: "Forecast →",
                position: "top",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 10,
              }}
            />
          )}

          {/* Historical data - solid lines */}
          <Area
            type="monotone"
            dataKey="revenueHistorical"
            stroke="hsl(160, 84%, 45%)"
            fillOpacity={1}
            fill="url(#colorRevenueHistorical)"
            strokeWidth={2}
            connectNulls={false}
            name="Revenue"
          />
          <Area
            type="monotone"
            dataKey="profitHistorical"
            stroke="hsl(200, 80%, 50%)"
            fillOpacity={1}
            fill="url(#colorProfitHistorical)"
            strokeWidth={2}
            connectNulls={false}
            name="Profit"
          />

          {/* Forecast data - dashed lines */}
          <Area
            type="monotone"
            dataKey="revenueForecast"
            stroke="hsl(160, 84%, 45%)"
            fillOpacity={1}
            fill="url(#colorRevenueForecast)"
            strokeWidth={2}
            strokeDasharray="6 4"
            connectNulls={false}
            dot={{ r: 2, strokeWidth: 2, fill: "hsl(160, 84%, 45%)" }}
            activeDot={{ r: 3 }}
            name="Revenue Forecast"
          />
          <Area
            type="monotone"
            dataKey="profitForecast"
            stroke={profitForecastColor}
            fillOpacity={1}
            fill="url(#colorProfitForecast)"
            strokeWidth={2}
            strokeDasharray="6 4"
            connectNulls={false}
            dot={{ r: 2, strokeWidth: 2, fill: profitForecastColor }}
            activeDot={{ r: 3 }}
            name="Profit Forecast"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
