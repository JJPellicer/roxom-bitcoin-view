import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine, Area } from "recharts";
import { AssetData } from "@/pages/Simulator";
import { Info, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AssetChartProps {
  data: AssetData[];
  assetName: string;
  selectedDate: string | null;
}

const AssetChart = ({ data, assetName, selectedDate }: AssetChartProps) => {
  const [showConfidenceBands, setShowConfidenceBands] = useState(true);
  
  const chartData = useMemo(() => {
    if (!data.length) return { 
      allData: [], 
      selectedPoint: null, 
      hasConfidenceBands: false,
      forecastStartDate: null 
    };

    const hasConfidenceBands = data.some(d => d.future_p25 !== undefined && d.future_p75 !== undefined);
    const forecastStartIndex = data.findIndex(d => d.future_p25 !== undefined);
    const forecastStartDate = forecastStartIndex >= 0 ? data[forecastStartIndex].date : null;

    if (!selectedDate) {
      return { 
        allData: data, 
        selectedPoint: null, 
        hasConfidenceBands,
        forecastStartDate 
      };
    }

    const selectedIndex = data.findIndex((d) => d.date === selectedDate);
    if (selectedIndex === -1) {
      return { 
        allData: data, 
        selectedPoint: null, 
        hasConfidenceBands,
        forecastStartDate 
      };
    }

    const selectedPoint = data[selectedIndex];

    return { 
      allData: data, 
      selectedPoint, 
      hasConfidenceBands,
      forecastStartDate 
    };
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {assetName} Priced in Bitcoin
        </h2>
        {chartData.hasConfidenceBands && (
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfidenceBands(!showConfidenceBands)}
                  className="gap-2"
                >
                  {showConfidenceBands ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {showConfidenceBands ? "Hide" : "Show"} Bands
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Toggle forecast uncertainty bands</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        )}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData.allData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b388ff" stopOpacity={0.35}/>
              <stop offset="100%" stopColor="#b388ff" stopOpacity={0.15}/>
            </linearGradient>
          </defs>
          
          <XAxis
            dataKey="date"
            stroke="rgba(255, 255, 255, 0.3)"
            tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 13 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const year = date.getFullYear();
              return `${month}-${year}`;
            }}
            minTickGap={100}
          />
          <YAxis
            stroke="rgba(255, 255, 255, 0.3)"
            tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 13 }}
            tickFormatter={(value) => {
              if (value === 0) return "0.0000";
              if (value < 0.001) return value.toFixed(7);
              if (value < 0.01) return value.toFixed(5);
              if (value < 1) return value.toFixed(4);
              return value.toFixed(3);
            }}
            domain={['auto', 'auto']}
            tickCount={7}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Vertical line marking forecast start */}
          {chartData.forecastStartDate && (
            <ReferenceLine
              x={chartData.forecastStartDate}
              stroke="#b388ff"
              strokeWidth={2}
              strokeDasharray="6 4"
              label={{
                value: "Forecast Starts",
                position: "insideTopRight",
                fill: "#b388ff",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}
          
          {/* Confidence band - P25 to P75 range for future data */}
          {chartData.hasConfidenceBands && showConfidenceBands && (
            <Area
              type="monotone"
              dataKey="future_p75"
              stroke="none"
              fill="url(#confidenceBand)"
              isAnimationActive={false}
            />
          )}
          {chartData.hasConfidenceBands && showConfidenceBands && (
            <Area
              type="monotone"
              dataKey="future_p25"
              stroke="none"
              fill="hsl(var(--background))"
              isAnimationActive={false}
            />
          )}
          
          {/* Main median line */}
          <Line
            type="monotone"
            dataKey="price_in_btc"
            stroke="#b388ff"
            strokeWidth={3}
            dot={false}
            isAnimationActive={true}
            connectNulls
            style={{
              filter: "drop-shadow(0 0 8px rgba(179, 136, 255, 0.5))",
            }}
          />
          

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
            <div className="w-8 h-0.5 rounded" style={{ backgroundColor: "#b388ff", boxShadow: "0 0 4px rgba(179, 136, 255, 0.5)" }} />
            <span>Median (P50)</span>
          </div>
          {showConfidenceBands && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-3 rounded" style={{ backgroundColor: "rgba(179, 136, 255, 0.25)" }} />
              <span>25th-75th Percentile Range</span>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex items-center">
                      <Info className="w-4 h-4 ml-1 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">Forecast Uncertainty</p>
                    <p className="text-xs">
                      The shaded area shows the 25th to 75th percentile range, meaning 50% of possible outcomes fall within this band. 
                      A wider band indicates higher uncertainty, while a narrower band suggests more confidence in the forecast.
                    </p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default AssetChart;
