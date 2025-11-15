import { useState, useMemo } from "react";
import AssetChart from "@/components/AssetChart";
import AssetSelector from "@/components/AssetSelector";
import BasketBuilder from "@/components/BasketBuilder";
import DateSelector from "@/components/DateSelector";
import DateRangeSelector from "@/components/DateRangeSelector";
import InsightsPanel from "@/components/InsightsPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isBasketMode, setIsBasketMode] = useState(false);
  
  const currentData = isBasketMode ? basketData : assetData;
  
  // Get min and max dates from data
  const { minDate, maxDate } = useMemo(() => {
    if (currentData.length === 0) return { minDate: "", maxDate: "" };
    const dates = currentData.map(d => d.date).sort();
    return { minDate: dates[0], maxDate: dates[dates.length - 1] };
  }, [currentData]);
  
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Initialize date range when data loads
  useMemo(() => {
    if (minDate && maxDate && !startDate && !endDate) {
      setStartDate(minDate);
      setEndDate(maxDate);
    }
  }, [minDate, maxDate, startDate, endDate]);
  
  // Filter data by date range
  const filteredData = useMemo(() => {
    if (!startDate || !endDate) return currentData;
    return currentData.filter(d => d.date >= startDate && d.date <= endDate);
  }, [currentData, startDate, endDate]);

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
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            LAMBDIC Simulator
          </h1>
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

        {/* Date Range Filter */}
        {currentData.length > 0 && (
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            minDate={minDate}
            maxDate={maxDate}
          />
        )}

        {/* Chart Section */}
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <AssetChart
              data={filteredData}
              assetName={isBasketMode ? "Portfolio" : selectedAsset}
              selectedDate={selectedDate}
            />
            <DateSelector
              data={filteredData}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>

          {/* Insights Panel */}
          <InsightsPanel
            data={filteredData}
            assetName={isBasketMode ? "Portfolio" : selectedAsset}
            selectedDate={selectedDate}
          />
        </div>
      </div>
    </div>
  );
};

export default Simulator;
