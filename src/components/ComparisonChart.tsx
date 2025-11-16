import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { AssetData } from "@/pages/Simulator";
import { LayoutGrid, Layers } from "lucide-react";

interface ComparisonChartProps {
  assetsData: { assetId: string; assetName: string; data: AssetData[] }[];
  selectedDate: string | null;
  viewMode: "overlay" | "separate";
  onViewModeChange: (mode: "overlay" | "separate") => void;
}

const ASSET_COLORS = [
  "#b388ff", // Purple
  "#00d4ff", // Cyan
  "#ff6b6b", // Red
  "#4ecdc4", // Teal
  "#ffd93d", // Yellow
];

const ComparisonChart = ({ assetsData, selectedDate, viewMode, onViewModeChange }: ComparisonChartProps) => {
  // Merge all data by date for overlay mode
  const mergedData = useMemo(() => {
    if (assetsData.length === 0) return [];

    const dateMap = new Map<string, any>();

    assetsData.forEach((asset, index) => {
      asset.data.forEach((dataPoint) => {
        if (!dateMap.has(dataPoint.date)) {
          dateMap.set(dataPoint.date, { date: dataPoint.date });
        }
        dateMap.get(dataPoint.date)![asset.assetId] = dataPoint.price_in_btc;
      });
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [assetsData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="text-muted-foreground text-sm mb-2">{payload[0].payload.date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-foreground font-mono text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(6)} BTC
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (assetsData.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          Select assets to compare
        </div>
      </Card>
    );
  }

  // Overlay Mode - All assets on one chart
  if (viewMode === "overlay") {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Asset Comparison - Overlay View
          </h2>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => onViewModeChange("overlay")}
            >
              <Layers className="h-4 w-4 mr-2" />
              Overlay
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewModeChange("separate")}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Separate
            </Button>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={mergedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="line"
            />
            
            {selectedDate && (
              <ReferenceLine
                x={selectedDate}
                stroke="rgba(179, 136, 255, 0.4)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: "Selected Date",
                  position: "top",
                  fill: "rgba(255, 255, 255, 0.5)",
                  fontSize: 11,
                }}
              />
            )}

            {assetsData.map((asset, index) => (
              <Line
                key={asset.assetId}
                type="monotone"
                dataKey={asset.assetId}
                name={asset.assetName}
                stroke={ASSET_COLORS[index % ASSET_COLORS.length]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>
    );
  }

  // Separate Mode - Individual charts
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Asset Comparison - Separate View
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewModeChange("overlay")}
          >
            <Layers className="h-4 w-4 mr-2" />
            Overlay
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onViewModeChange("separate")}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Separate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assetsData.map((asset, index) => (
          <Card key={asset.assetId} className="p-6 bg-card border-border">
            <h3 className="text-md font-semibold mb-4 text-foreground">
              {asset.assetName} / BTC
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={asset.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <XAxis
                  dataKey="date"
                  stroke="rgba(255, 255, 255, 0.3)"
                  tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 11 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.getFullYear().toString();
                  }}
                  minTickGap={80}
                />
                <YAxis
                  stroke="rgba(255, 255, 255, 0.3)"
                  tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 11 }}
                  tickFormatter={(value) => value.toFixed(4)}
                  domain={['auto', 'auto']}
                  tickCount={6}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card border border-border p-2 rounded-lg shadow-lg">
                          <p className="text-muted-foreground text-xs">{data.date}</p>
                          <p className="text-foreground font-mono text-sm">
                            {data.price_in_btc.toFixed(6)} BTC
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                
                {selectedDate && (
                  <ReferenceLine
                    x={selectedDate}
                    stroke="rgba(179, 136, 255, 0.4)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                )}

                <Line
                  type="monotone"
                  dataKey="price_in_btc"
                  stroke={ASSET_COLORS[index % ASSET_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  style={{
                    filter: `drop-shadow(0 0 8px ${ASSET_COLORS[index % ASSET_COLORS.length]}80)`,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ComparisonChart;
