import { useEffect, useMemo, useState } from "react";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { apiUrl } from "@/lib/config";

export interface ForecastDataPoint {
  /** ISO date string used for X-axis ordering/positioning */
  date: string;
  /** Human-readable label (used in tooltips) */
  month: string;
  revenue: number;
  profit: number;
  isForecast: boolean;
}

export interface ForecastResult {
  historicalData: ForecastDataPoint[];
  forecastData: ForecastDataPoint[];
  combinedData: ForecastDataPoint[];
  isLoading: boolean;
  error: string | null;
  forecastWarning: string | null;
  hasNegativeForecast: boolean;
}

const isValidDate = (d: Date) => Number.isFinite(d.getTime());

const isoStartOfMonth = (d: Date) => startOfMonth(d).toISOString();

const labelForDate = (d: Date) => format(d, "MMM");

const DEFAULT_HISTORICAL: ForecastDataPoint[] = [
  { date: "2025-01-01T00:00:00.000Z", month: "Jan", revenue: 185, profit: 70, isForecast: false },
  { date: "2025-02-01T00:00:00.000Z", month: "Feb", revenue: 195, profit: 80, isForecast: false },
  { date: "2025-03-01T00:00:00.000Z", month: "Mar", revenue: 205, profit: 85, isForecast: false },
  { date: "2025-04-01T00:00:00.000Z", month: "Apr", revenue: 210, profit: 95, isForecast: false },
  { date: "2025-05-01T00:00:00.000Z", month: "May", revenue: 205, profit: 90, isForecast: false },
  { date: "2025-06-01T00:00:00.000Z", month: "Jun", revenue: 200, profit: 100, isForecast: false },
];

const buildHistoricalFromMetrics = (metrics: any, endDate: Date): ForecastDataPoint[] => {
  const count = Math.max(1, Number(metrics?.historicalDataPoints ?? 6));
  const safeEnd = isValidDate(endDate) ? startOfMonth(endDate) : startOfMonth(new Date());
  const start = subMonths(safeEnd, count - 1);

  const dates = Array.from({ length: count }, (_, i) => addMonths(start, i));

  const lastRevenue = Number(metrics?.lastMonthRevenue ?? 0);
  const lastProfit = Number(metrics?.lastMonthProfit ?? 0);

  const revGrowth = Number(metrics?.averageRevenueGrowthRate ?? 0) / 100;
  const profitGrowth = Number(metrics?.averageProfitGrowthRate ?? 0) / 100;

  const revDenom = 1 + revGrowth;
  const profitDenom = 1 + profitGrowth;

  const revenueSeries = Array.from({ length: count }, () => 0);
  const profitSeries = Array.from({ length: count }, () => 0);

  revenueSeries[count - 1] = Number.isFinite(lastRevenue) ? lastRevenue : 0;
  profitSeries[count - 1] = Number.isFinite(lastProfit) ? lastProfit : 0;

  for (let i = count - 2; i >= 0; i--) {
    revenueSeries[i] = revenueSeries[i + 1] / (revDenom === 0 ? 1 : revDenom);
    profitSeries[i] = profitSeries[i + 1] / (profitDenom === 0 ? 1 : profitDenom);
  }

  return dates.map((d, i) => ({
    date: isoStartOfMonth(d),
    month: labelForDate(d),
    revenue: Math.max(0, Math.round(revenueSeries[i])),
    // Profit can legitimately be negative; do not clamp to 0.
    profit: Math.round(profitSeries[i]),
    isForecast: false,
  }));
};

export function useForecast(): ForecastResult {
  const [historical, setHistorical] = useState<ForecastDataPoint[]>(DEFAULT_HISTORICAL);
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecastWarning, setForecastWarning] = useState<string | null>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(apiUrl("/api/financial-forecast"));

        if (!response.ok) {
          throw new Error("Failed to fetch forecast data");
        }

        const data = await response.json();
        const metrics = (data as any)?.analysisMetrics;

        const rawForecast = Array.isArray((data as any)?.forecast)
          ? (data as any).forecast
          : Array.isArray(data)
            ? data
            : [];

        // If backend provides dates, anchor historical series to end right before the first forecast date.
        const forecastDates = rawForecast
          .map((item: any) => new Date(item?.date))
          .filter(isValidDate)
          .sort((a: Date, b: Date) => a.getTime() - b.getTime());

        const firstForecastDate = forecastDates.length ? forecastDates[0] : null;
        const historicalEndDate = firstForecastDate
          ? subMonths(startOfMonth(firstForecastDate), 1)
          : startOfMonth(new Date());

        if (
          metrics &&
          typeof metrics.lastMonthRevenue !== "undefined" &&
          typeof metrics.lastMonthProfit !== "undefined"
        ) {
          setHistorical(buildHistoricalFromMetrics(metrics, historicalEndDate));
        }

        const forecast: ForecastDataPoint[] = rawForecast
          .map((item: any, idx: number) => {
            const monthRaw = item?.month ?? item?.label ?? item?.period;
            const revenueRaw =
              item?.revenue ??
              item?.projectedRevenue ??
              item?.projected_revenue ??
              item?.predictedRevenue;
            const profitRaw =
              item?.profit ??
              item?.projectedProfit ??
              item?.projected_profit ??
              item?.predictedProfit;

            const dateFromApi = item?.date ? new Date(item.date) : null;
            const date = dateFromApi && isValidDate(dateFromApi)
              ? isoStartOfMonth(dateFromApi)
              : typeof monthRaw === "number" && Number.isFinite(monthRaw)
                ? isoStartOfMonth(addMonths(historicalEndDate, monthRaw))
                : isoStartOfMonth(addMonths(historicalEndDate, idx + 1));

            const label =
              item?.monthLabel ?? (date ? labelForDate(new Date(date)) : String(monthRaw ?? ""));

            return {
              date,
              month: String(label ?? ""),
              revenue: Number(revenueRaw ?? 0),
              profit: Number(profitRaw ?? 0),
              isForecast: true,
            } satisfies ForecastDataPoint;
          })
          .filter((p: ForecastDataPoint) => p.date.length > 0);

        // Ensure timeline order by date
        forecast.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setForecastData(forecast);
        setError(null);
        
        // Extract forecast warning from backend response
        const warning = (data as any)?.forecast_warning ?? (data as any)?.forecastWarning ?? null;
        setForecastWarning(warning);
      } catch (err) {
        console.warn("Forecast API unavailable, using fallback data:", err);

        const end = startOfMonth(new Date());
        const fallbackForecast: ForecastDataPoint[] = [1, 2, 3].map((m) => {
          const d = addMonths(end, m);
          return {
            date: isoStartOfMonth(d),
            month: labelForDate(d),
            revenue: 0,
            profit: 0,
            isForecast: true,
          };
        });

        setForecastData(fallbackForecast);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForecast();
  }, []);

  const combinedData = useMemo(() => {
    const all = [...historical, ...forecastData];
    return all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [historical, forecastData]);

  // Check if any forecast profit goes negative
  const hasNegativeForecast = useMemo(() => {
    return forecastData.some((point) => point.profit < 0);
  }, [forecastData]);

  return {
    historicalData: historical,
    forecastData,
    combinedData,
    isLoading,
    error,
    forecastWarning,
    hasNegativeForecast,
  };
}
