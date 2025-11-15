import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot, Area } from "recharts";
import { AssetData } from "@/pages/Simulator";

interface AssetChartProps {
  data: AssetData[];
  assetName: string;
  selectedDate: string | null;
}

const AssetChart = ({ data, assetName, selectedDate }: AssetChartProps) => {
  const chartData = useMemo(() => {
    if (!data.length) return { past: [], future: [], selectedPoint: null, hasConfidenceBands: false };

    const hasConfidenceBands = data.some(d => d.future_p25 !== undefined && d.future_p75 !== undefined);

    if (!selectedDate) {
      return { past: data, future: [], selectedPoint: null, hasConfidenceBands };
    }

    const selectedIndex = data.findIndex((d) => d.date === selectedDate);
    if (selectedIndex === -1) {
      return { past: data, future: [], selectedPoint: null, hasConfidenceBands };
    }

    const past = data.slice(0, selectedIndex + 1);
    const future = data.slice(selectedIndex);
    const selectedPoint = data[selectedIndex];

    return { past, future, selectedPoint, hasConfidenceBands };
  }, [data, selectedDate]);

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
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
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
          
          {/* Confidence band for past data */}
          {chartData.hasConfidenceBands && chartData.past.length > 0 && (
            <Area
              data={chartData.past}
              type="monotone"
              dataKey="future_p75"
              stroke="none"
              fill="url(#confidenceGradient)"
              isAnimationActive={true}
            />
          )}
          
          {/* Past median line */}
          <Line
            data={chartData.past}
            type="monotone"
            dataKey="price_in_btc"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={false}
            isAnimationActive={true}
            style={{
              filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))",
            }}
          />
          
          {/* Lower confidence bound for past */}
          {chartData.hasConfidenceBands && chartData.past.length > 0 && (
            <Line
              data={chartData.past}
              type="monotone"
              dataKey="future_p25"
              stroke="hsl(var(--primary))"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              opacity={0.4}
            />
          )}
          
          {/* Confidence band for future data */}
          {chartData.hasConfidenceBands && chartData.future.length > 0 && (
            <Area
              data={chartData.future}
              type="monotone"
              dataKey="future_p75"
              stroke="none"
              fill="hsl(var(--muted-foreground) / 0.1)"
              isAnimationActive={true}
            />
          )}
          
          {/* Future median line */}
          {chartData.future.length > 0 && (
            <Line
              data={chartData.future}
              type="monotone"
              dataKey="price_in_btc"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              opacity={0.5}
            />
          )}
          
          {/* Lower confidence bound for future */}
          {chartData.hasConfidenceBands && chartData.future.length > 0 && (
            <Line
              data={chartData.future}
              type="monotone"
              dataKey="future_p25"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              opacity={0.3}
            />
          )}

          {/* Selected point */}
          {chartData.selectedPoint && (
            <ReferenceDot
              x={chartData.selectedPoint.date}
              y={chartData.selectedPoint.price_in_btc}
              r={6}
              fill="hsl(var(--secondary))"
              stroke="hsl(var(--secondary))"
              strokeWidth={2}
              style={{
                filter: "drop-shadow(0 0 10px hsl(var(--secondary)))",
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      {chartData.hasConfidenceBands && (
        <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-primary" style={{ filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.5))" }} />
            <span>Median</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 bg-primary opacity-20 rounded" />
            <span>25th-75th Percentile</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AssetChart;
