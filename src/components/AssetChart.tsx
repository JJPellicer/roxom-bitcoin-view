import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, ReferenceLine } from "recharts";
import { AssetData } from "@/pages/Simulator";

interface AssetChartProps {
  data: AssetData[];
  assetName: string;
}

const AssetChart = ({ data, assetName }: AssetChartProps) => {
  const chartData = useMemo(() => {
    if (!data.length) return { historical: [], forecast: [], transitionDate: null, hasConfidenceBands: false };

    // Find the transition point between historical and forecast data
    const firstForecastIndex = data.findIndex(d => d.future_p25 !== undefined && d.future_p75 !== undefined);
    
    if (firstForecastIndex === -1) {
      // No forecast data, all historical
      return { historical: data, forecast: [], transitionDate: null, hasConfidenceBands: false };
    }

    const historical = data.slice(0, firstForecastIndex);
    const forecast = data.slice(firstForecastIndex);
    const transitionDate = forecast[0]?.date || null;

    return { historical, forecast, transitionDate, hasConfidenceBands: true };
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="text-primary font-semibold">{assetName}</p>
          <p className="text-muted-foreground text-sm">{data.date}</p>
          <p className="text-foreground font-mono">
            {data.price_in_btc.toFixed(6)} BTC
          </p>
          {data.future_p25 !== undefined && data.future_p75 !== undefined && (
            <div className="mt-2 text-xs text-muted-foreground">
              <p>Range: {data.future_p25.toFixed(6)} - {data.future_p75.toFixed(6)}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (!data.length) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          Select an asset or build a portfolio to view the chart
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold mb-4 text-foreground">
        {assetName} Priced in Bitcoin
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.getFullYear().toString();
            }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickFormatter={(value) => value.toFixed(6)}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Transition line between historical and forecast */}
          {chartData.transitionDate && (
            <ReferenceLine
              x={chartData.transitionDate}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              strokeWidth={1}
              opacity={0.5}
              label={{
                value: "Forecast →",
                position: "top",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 10,
              }}
            />
          )}
          
          {/* Historical line */}
          {chartData.historical.length > 0 && (
            <Line
              data={chartData.historical}
              type="monotone"
              dataKey="price_in_btc"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={true}
              style={{
                filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))",
              }}
            />
          )}
          
          {/* Forecast confidence band (P25-P75) */}
          {chartData.hasConfidenceBands && chartData.forecast.length > 0 && (
            <>
              <Area
                data={chartData.forecast}
                type="monotone"
                dataKey="future_p25"
                stroke="none"
                fill="transparent"
                isAnimationActive={false}
              />
              <Area
                data={chartData.forecast}
                type="monotone"
                dataKey="future_p75"
                stroke="none"
                fill="url(#forecastBand)"
                isAnimationActive={false}
              />
            </>
          )}
          
          {/* Forecast median line (P50) */}
          {chartData.forecast.length > 0 && (
            <Line
              data={chartData.forecast}
              type="monotone"
              dataKey="price_in_btc"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
              style={{
                filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))",
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      {chartData.hasConfidenceBands && (
        <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-primary" style={{ filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.5))" }} />
            <span>Historical & Median Forecast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 bg-primary opacity-20 rounded" />
            <span>Forecast Range (P25-P75)</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AssetChart;
