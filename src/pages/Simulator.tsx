import { useState } from "react";
import AssetChart from "@/components/AssetChart";
import AssetSelector from "@/components/AssetSelector";
import BasketBuilder from "@/components/BasketBuilder";
import InsightsPanel from "@/components/InsightsPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import roxomLogo from "@/assets/roxom-logo.png";

export interface AssetData {
  date: string;
  price_in_btc: number;
  future_p25?: number;
  future_p75?: number;
}

export interface BasketAsset {
  name: string;
  weight: number;
}

const Simulator = () => {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState<string>("gold");
  const [assetData, setAssetData] = useState<AssetData[]>([]);
  const [basketAssets, setBasketAssets] = useState<BasketAsset[]>([]);
  const [basketData, setBasketData] = useState<AssetData[]>([]);
  const [isBasketMode, setIsBasketMode] = useState(false);
  
  const currentData = isBasketMode ? basketData : assetData;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-3">
            <img src={roxomLogo} alt="Roxom" className="h-8" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              BTC Simulator
            </h1>
          </div>
          <div className="w-32" />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Mode Toggle */}
        <div className="flex justify-center gap-4">
          <Button
            variant={!isBasketMode ? "default" : "outline"}
            onClick={() => setIsBasketMode(false)}
            className="min-w-[150px]"
          >
            Single Asset
          </Button>
          <Button
            variant={isBasketMode ? "default" : "outline"}
            onClick={() => setIsBasketMode(true)}
            className="min-w-[150px]"
          >
            Portfolio Basket
          </Button>
        </div>

        {/* Asset Selector / Basket Builder */}
        {!isBasketMode ? (
          <AssetSelector
            selectedAsset={selectedAsset}
            onAssetChange={setSelectedAsset}
            onDataLoad={setAssetData}
          />
        ) : (
          <BasketBuilder
            basketAssets={basketAssets}
            onBasketChange={setBasketAssets}
            onBasketDataLoad={setBasketData}
          />
        )}

        {/* Chart Section */}
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <AssetChart
            data={currentData}
            assetName={isBasketMode ? "Portfolio" : selectedAsset}
          />

          {/* Insights Panel */}
          <InsightsPanel
            data={currentData}
            assetName={isBasketMode ? "Portfolio" : selectedAsset}
          />
        </div>
      </div>
    </div>
  );
};

export default Simulator;
