import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AssetData } from "@/pages/Simulator";

interface AssetSelectorProps {
  selectedAsset: string;
  onAssetChange: (asset: string) => void;
  onDataLoad: (data: AssetData[]) => void;
}

const ASSETS = [
  { id: "gold", name: "Gold", icon: "🥇", file: "gold_btc.csv" },
  { id: "sp500", name: "S&P 500", icon: "📈", file: "sp500_btc.csv" },
  { id: "oil", name: "Oil", icon: "🛢️", file: "oil_btc.csv" },
  { id: "cpi", name: "CPI", icon: "💵", file: "cpi_btc.csv" },
  { id: "us100", name: "US100", icon: "📊", file: "us100_btc.csv" },
];

const AssetSelector = ({ selectedAsset, onAssetChange, onDataLoad }: AssetSelectorProps) => {
  useEffect(() => {
    const loadData = async () => {
      const asset = ASSETS.find((a) => a.id === selectedAsset);
      if (!asset) return;

      try {
        const response = await fetch(`/data/${asset.file}`);
        const text = await response.text();
        const lines = text.trim().split("\n");
        const headers = lines[0].split(",").map(h => h.trim());
        
        const data: AssetData[] = lines.slice(1).map((line) => {
          const values = line.split(",");
          const date = values[0].trim();
          
          // Check if this is the new format with future predictions
          if (headers.includes("future_median")) {
            return {
              date,
              price_in_btc: parseFloat(values[1].trim()), // future_median
              future_p25: parseFloat(values[2].trim()),
              future_p75: parseFloat(values[3].trim()),
            };
          } else {
            // Old format with just price_in_btc
            return {
              date,
              price_in_btc: parseFloat(values[1].trim()),
            };
          }
        });
        onDataLoad(data);
      } catch (error) {
        console.error("Error loading data:", error);
        onDataLoad([]);
      }
    };

    loadData();
  }, [selectedAsset, onDataLoad]);

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Select Asset</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {ASSETS.map((asset) => (
          <button
            key={asset.id}
            onClick={() => onAssetChange(asset.id)}
            className={cn(
              "p-6 rounded-lg border-2 transition-all duration-200",
              "hover:scale-105 hover:shadow-lg hover:shadow-primary/20",
              "flex flex-col items-center gap-2",
              selectedAsset === asset.id
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                : "border-border bg-muted hover:border-primary/50"
            )}
          >
            <span className="text-3xl">{asset.icon}</span>
            <span className={cn(
              "font-medium",
              selectedAsset === asset.id ? "text-primary" : "text-foreground"
            )}>
              {asset.name}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default AssetSelector;
