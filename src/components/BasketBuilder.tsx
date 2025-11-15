import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { BasketAsset, AssetData } from "@/pages/Simulator";
import { toast } from "sonner";

interface BasketBuilderProps {
  basketAssets: BasketAsset[];
  onBasketChange: (assets: BasketAsset[]) => void;
  onBasketDataLoad: (data: AssetData[]) => void;
}

const AVAILABLE_ASSETS = [
  { id: "gold", name: "Gold", file: "gold_btc.csv" },
  { id: "sp500", name: "S&P 500", file: "sp500_btc.csv" },
  { id: "oil", name: "Oil", file: "oil_btc.csv" },
  { id: "cpi", name: "CPI", file: "cpi_btc.csv" },
  { id: "us100", name: "US100", file: "us100_btc.csv" },
];

const BasketBuilder = ({ basketAssets, onBasketChange, onBasketDataLoad }: BasketBuilderProps) => {
  const [newAsset, setNewAsset] = useState("");
  const [newWeight, setNewWeight] = useState("");

  const totalWeight = basketAssets.reduce((sum, asset) => sum + asset.weight, 0);

  const addAsset = () => {
    if (!newAsset) {
      toast.error("Please select an asset");
      return;
    }

    if (!newWeight || parseFloat(newWeight) <= 0) {
      toast.error("Please enter a valid weight");
      return;
    }

    if (basketAssets.some((a) => a.name === newAsset)) {
      toast.error("Asset already in basket");
      return;
    }

    if (basketAssets.length >= 5) {
      toast.error("Maximum 5 assets allowed");
      return;
    }

    const updatedAssets = [...basketAssets, { name: newAsset, weight: parseFloat(newWeight) }];
    onBasketChange(updatedAssets);
    setNewAsset("");
    setNewWeight("");
  };

  const removeAsset = (assetName: string) => {
    onBasketChange(basketAssets.filter((a) => a.name !== assetName));
  };

  const updateWeight = (assetName: string, weight: string) => {
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight) || numWeight < 0) return;

    onBasketChange(
      basketAssets.map((a) => (a.name === assetName ? { ...a, weight: numWeight } : a))
    );
  };

  useEffect(() => {
    if (basketAssets.length === 0) {
      onBasketDataLoad([]);
      return;
    }

    const loadBasketData = async () => {
      try {
        // Load all asset data
        const allData = await Promise.all(
          basketAssets.map(async (asset) => {
            const assetConfig = AVAILABLE_ASSETS.find((a) => a.id === asset.name);
            if (!assetConfig) return { asset, data: [] };

            const assetData: AssetData[] = [];

            // Load historical data
            try {
              const historicalResponse = await fetch(`/data/${asset.name}_historical.csv`);
              const historicalText = await historicalResponse.text();
              const historicalLines = historicalText.trim().split("\n");

              for (let i = 1; i < historicalLines.length; i++) {
                const line = historicalLines[i].trim();
                if (!line) continue;

                const parts = line.split(",");
                const price = parseFloat(parts[1]);

                if (!isNaN(price)) {
                  assetData.push({
                    date: parts[0],
                    price_in_btc: price,
                  });
                }
              }
            } catch (error) {
              console.error(`Historical data not found for ${asset.name}`);
            }

            // Load future predictions
            try {
              const futureResponse = await fetch(`/data/${assetConfig.file}`);
              const futureText = await futureResponse.text();
              const futureLines = futureText.trim().split("\n");

              for (let i = 1; i < futureLines.length; i++) {
                const line = futureLines[i].trim();
                if (!line) continue;

                const [date, median, p25, p75] = line.split(",");
                const medianVal = parseFloat(median);
                const p25Val = parseFloat(p25);
                const p75Val = parseFloat(p75);

                if (!isNaN(medianVal) && !isNaN(p25Val) && !isNaN(p75Val)) {
                  assetData.push({
                    date,
                    price_in_btc: medianVal,
                    future_p25: p25Val,
                    future_p75: p75Val,
                  });
                }
              }
            } catch (error) {
              console.error(`Future data not found for ${asset.name}`);
            }

            return { asset, data: assetData };
          })
        );

        // Find common date range
        const allDates = allData.map((d) => new Set(d.data.map((entry) => entry.date)));
        const commonDates = Array.from(
          allDates.reduce((acc, dates) => {
            const filtered = new Set([...acc].filter((d) => dates.has(d)));
            return filtered;
          })
        ).sort();

        // Calculate weighted portfolio value
        const portfolioData: AssetData[] = commonDates.map((date) => {
          let totalValue = 0;
          let totalP25 = 0;
          let totalP75 = 0;
          let hasConfidenceBands = false;

          allData.forEach(({ asset, data }) => {
            const entry = data.find((d) => d.date === date);
            if (entry) {
              const weight = asset.weight / 100;
              totalValue += entry.price_in_btc * weight;
              
              if (entry.future_p25 !== undefined && entry.future_p75 !== undefined) {
                totalP25 += entry.future_p25 * weight;
                totalP75 += entry.future_p75 * weight;
                hasConfidenceBands = true;
              }
            }
          });

          const result: AssetData = {
            date,
            price_in_btc: totalValue,
          };

          if (hasConfidenceBands) {
            result.future_p25 = totalP25;
            result.future_p75 = totalP75;
          }

          return result;
        });

        onBasketDataLoad(portfolioData);
      } catch (error) {
        console.error("Error loading basket data:", error);
        onBasketDataLoad([]);
      }
    };

    loadBasketData();
  }, [basketAssets, onBasketDataLoad]);

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Build Your Portfolio</h2>

      {/* Current Basket */}
      {basketAssets.length > 0 && (
        <div className="mb-6 space-y-3">
          {basketAssets.map((asset) => (
            <div
              key={asset.name}
              className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border"
            >
              <span className="font-medium text-foreground flex-1">
                {AVAILABLE_ASSETS.find((a) => a.id === asset.name)?.name || asset.name}
              </span>
              <Input
                type="number"
                value={asset.weight}
                onChange={(e) => updateWeight(asset.name, e.target.value)}
                className="w-20 text-center"
                min="0"
                step="0.1"
              />
              <span className="text-muted-foreground">%</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeAsset(asset.name)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border-2 border-border">
            <span className="font-semibold text-foreground">Total Weight:</span>
            <span
              className={`font-bold ${
                Math.abs(totalWeight - 100) < 0.01
                  ? "text-primary"
                  : "text-destructive"
              }`}
            >
              {totalWeight.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Add Asset */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <Select value={newAsset} onValueChange={setNewAsset}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_ASSETS.filter(
                (a) => !basketAssets.some((ba) => ba.name === a.id)
              ).map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Weight %"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="w-28"
            min="0"
            step="0.1"
          />
          <Button onClick={addAsset} disabled={basketAssets.length >= 5}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Add up to 5 assets. Weights should total 100% for accurate representation.
        </p>
      </div>
    </Card>
  );
};

export default BasketBuilder;
