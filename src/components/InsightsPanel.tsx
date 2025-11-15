import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { AssetData } from "@/pages/Simulator";
import { TrendingUp, TrendingDown, Calendar, Bitcoin } from "lucide-react";

interface InsightsPanelProps {
  data: AssetData[];
  assetName: string;
  selectedDate: string | null;
}

const InsightsPanel = ({ data, assetName, selectedDate }: InsightsPanelProps) => {
  const insights = useMemo(() => {
    if (!data.length) return null;

    const startData = data[0];
    const endData = data[data.length - 1];
    
    let selectedData = endData;
    if (selectedDate) {
      const found = data.find((d) => d.date === selectedDate);
      if (found) selectedData = found;
    }

    const percentChange =
      ((selectedData.price_in_btc - startData.price_in_btc) / startData.price_in_btc) * 100;

    return {
      currentValue: selectedData.price_in_btc,
      currentDate: selectedData.date,
      startValue: startData.price_in_btc,
      startDate: startData.date,
      endValue: endData.price_in_btc,
      endDate: endData.date,
      percentChange,
      isPositive: percentChange >= 0,
    };
  }, [data, selectedDate]);

  if (!insights) {
    return (
      <Card className="p-6 bg-card border-border h-fit">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Insights</h3>
        <p className="text-muted-foreground text-sm">No data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border h-fit space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Insights</h3>

      {/* Current Value */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Bitcoin className="h-4 w-4" />
          <span>Current Value</span>
        </div>
        <div className="text-2xl font-bold text-primary font-mono">
          {insights.currentValue.toFixed(6)} BTC
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Calendar className="h-3 w-3" />
          <span>{insights.currentDate}</span>
        </div>
      </div>

      {/* Performance */}
      <div className="space-y-2">
        <div className="text-muted-foreground text-sm">
          Performance Since {insights.startDate}
        </div>
        <div
          className={`flex items-center gap-2 text-2xl font-bold ${
            insights.isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {insights.isPositive ? (
            <TrendingUp className="h-6 w-6" />
          ) : (
            <TrendingDown className="h-6 w-6" />
          )}
          <span>{insights.percentChange.toFixed(2)}%</span>
        </div>
      </div>

      {/* Start Value */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Start ({insights.startDate})</span>
          <span className="font-mono text-foreground">
            {insights.startValue.toFixed(6)} BTC
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Latest ({insights.endDate})</span>
          <span className="font-mono text-foreground">
            {insights.endValue.toFixed(6)} BTC
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {selectedDate ? (
            <>
              In <span className="text-foreground font-medium">{insights.currentDate}</span>,{" "}
              {assetName} was worth{" "}
              <span className="text-primary font-mono font-medium">
                {insights.currentValue.toFixed(6)} BTC
              </span>
              . From {insights.startDate} to this point, the value changed{" "}
              <span
                className={`font-medium ${
                  insights.isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {insights.percentChange.toFixed(2)}%
              </span>{" "}
              in BTC terms.
            </>
          ) : (
            <>
              From <span className="text-foreground font-medium">{insights.startDate}</span> to{" "}
              <span className="text-foreground font-medium">{insights.endDate}</span>, {assetName}{" "}
              changed{" "}
              <span
                className={`font-medium ${
                  insights.isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {insights.percentChange.toFixed(2)}%
              </span>{" "}
              when priced in Bitcoin.
            </>
          )}
        </p>
      </div>
    </Card>
  );
};

export default InsightsPanel;
