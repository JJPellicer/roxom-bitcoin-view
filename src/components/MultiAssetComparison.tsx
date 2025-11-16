import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface MultiAssetComparisonProps {
  selectedAssets: string[];
  onSelectionChange: (assets: string[]) => void;
}

const COMMODITIES = [
  { id: "gold", name: "Gold", icon: "🥇" },
  { id: "sp500", name: "S&P 500", icon: "📈" },
  { id: "oil", name: "Oil", icon: "🛢️" },
  { id: "cpi", name: "CPI", icon: "💵" },
  { id: "us100", name: "US100", icon: "📊" },
];

const TREASURY_STOCKS = [
  { id: "mstr", name: "MicroStrategy", icon: "🟠" },
  { id: "gme", name: "GameStop", icon: "🎮" },
  { id: "mara", name: "Marathon", icon: "⛏️" },
  { id: "naka", name: "NAKA", icon: "🎯" },
  { id: "smlr", name: "SMLR", icon: "💎" },
];

const MultiAssetComparison = ({ selectedAssets, onSelectionChange }: MultiAssetComparisonProps) => {
  const toggleAsset = (assetId: string) => {
    if (selectedAssets.includes(assetId)) {
      onSelectionChange(selectedAssets.filter(id => id !== assetId));
    } else {
      if (selectedAssets.length >= 5) {
        toast.error("Maximum 5 assets can be compared at once");
        return;
      }
      onSelectionChange([...selectedAssets, assetId]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const renderAssetCheckboxes = (assets: typeof COMMODITIES) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all cursor-pointer"
          onClick={() => toggleAsset(asset.id)}
        >
          <Checkbox
            id={asset.id}
            checked={selectedAssets.includes(asset.id)}
            onCheckedChange={() => toggleAsset(asset.id)}
          />
          <Label
            htmlFor={asset.id}
            className="flex items-center gap-2 cursor-pointer flex-1"
          >
            <span className="text-2xl">{asset.icon}</span>
            <span className="font-medium">{asset.name}</span>
          </Label>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Select Assets to Compare
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {selectedAssets.length} of 5 selected
            </span>
            {selectedAssets.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="commodities" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="commodities">Commodities & Indices</TabsTrigger>
            <TabsTrigger value="treasury">🪙 BTC Treasury Stocks</TabsTrigger>
          </TabsList>
          <TabsContent value="commodities" className="mt-4">
            {renderAssetCheckboxes(COMMODITIES)}
          </TabsContent>
          <TabsContent value="treasury" className="mt-4">
            {renderAssetCheckboxes(TREASURY_STOCKS)}
          </TabsContent>
        </Tabs>

        {selectedAssets.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Select at least one asset to start comparison
          </p>
        )}
      </div>
    </Card>
  );
};

export default MultiAssetComparison;
