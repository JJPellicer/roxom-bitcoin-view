import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import { AssetData } from "@/pages/Simulator";

interface AssetChartProps {
  data: AssetData[];
  assetName: string;
  selectedDate: string | null;
}

const AssetChart = ({ data, assetName, selectedDate }: AssetChartProps) => {
  const chartData = useMemo(() => {
    if (!data.length) return { past: [], future: [], selectedPoint: null };

    if (!selectedDate) {
      return { past: data, future: [], selectedPoint: null };
    }

    const selectedIndex = data.findIndex((d) => d.date === selectedDate);
    if (selectedIndex === -1) {
      return { past: data, future: [], selectedPoint: null };
    }

    const past = data.slice(0, selectedIndex + 1);
    const future = data.slice(selectedIndex);
    const selectedPoint = data[selectedIndex];

    return { past, future, selectedPoint };
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
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickFormatter={(value) => new Date(value).getFullYear().toString()}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickFormatter={(value) => value.toFixed(6)}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Past data */}
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
          
          {/* Future data */}
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
    </Card>
  );
};

export default AssetChart;
