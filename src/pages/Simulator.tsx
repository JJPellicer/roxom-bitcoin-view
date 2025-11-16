import { useState, useMemo, useEffect } from "react";
import AssetChart from "@/components/AssetChart";
import AssetSelector from "@/components/AssetSelector";
import BasketBuilder from "@/components/BasketBuilder";
import MultiAssetComparison from "@/components/MultiAssetComparison";
import ComparisonChart from "@/components/ComparisonChart";
import DateSelector from "@/components/DateSelector";
import DateRangeSelector from "@/components/DateRangeSelector";
import InsightsPanel from "@/components/InsightsPanel";
import SocialShare from "@/components/SocialShare";
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [mode, setMode] = useState<"single" | "basket" | "compare">("single");
  
  // Comparison mode state
  const [comparisonAssets, setComparisonAssets] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<{ assetId: string; assetName: string; data: AssetData[] }[]>([]);
  const [comparisonViewMode, setComparisonViewMode] = useState<"overlay" | "separate">("overlay");
  
  const currentData = mode === "basket" ? basketData : assetData;
  
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

  // Load comparison data when assets change
  useEffect(() => {
    if (mode !== "compare" || comparisonAssets.length === 0) {
      setComparisonData([]);
      return;
    }

    const loadComparisonData = async () => {
      const allAssetsMap = [
        { id: "gold", name: "Gold" },
        { id: "sp500", name: "S&P 500" },
        { id: "oil", name: "Oil" },
        { id: "cpi", name: "CPI" },
        { id: "us100", name: "US100" },
        { id: "mstr", name: "MicroStrategy" },
        { id: "gme", name: "GameStop" },
        { id: "mara", name: "Marathon" },
        { id: "naka", name: "NAKA" },
        { id: "smlr", name: "SMLR" },
      ];

      const loadedData = await Promise.all(
        comparisonAssets.map(async (assetId) => {
          const assetInfo = allAssetsMap.find(a => a.id === assetId);
          if (!assetInfo) return null;

          const data: AssetData[] = [];

          // Load historical data
          try {
            const historicalResponse = await fetch(`/data/${assetId}_historical.csv`);
            const historicalText = await historicalResponse.text();
            const historicalLines = historicalText.trim().split("\n");

            for (let i = 1; i < historicalLines.length; i++) {
              const line = historicalLines[i].trim();
              if (!line) continue;

              const parts = line.split(",");
              const price = parseFloat(parts[1]);

              if (!isNaN(price)) {
                data.push({
                  date: parts[0],
                  price_in_btc: price,
                });
              }
            }
          } catch (error) {
            console.error(`Historical data not found for ${assetId}`);
          }

          // Load future data
          try {
            const futureResponse = await fetch(`/data/${assetId}_btc.csv`);
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
                data.push({
                  date,
                  price_in_btc: medianVal,
                  future_p25: p25Val,
                  future_p75: p75Val,
                });
              }
            }
          } catch (error) {
            console.error(`Future data not found for ${assetId}`);
          }

          return {
            assetId,
            assetName: assetInfo.name,
            data,
          };
        })
      );

      setComparisonData(loadedData.filter(d => d !== null) as { assetId: string; assetName: string; data: AssetData[] }[]);
    };

    loadComparisonData();
  }, [comparisonAssets, mode]);

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
            variant={mode === "single" ? "default" : "outline"}
            onClick={() => setMode("single")}
            className="min-w-[150px]"
          >
            Single Asset
          </Button>
          <Button
            variant={mode === "basket" ? "default" : "outline"}
            onClick={() => setMode("basket")}
            className="min-w-[150px]"
          >
            Portfolio Basket
          </Button>
          <Button
            variant={mode === "compare" ? "default" : "outline"}
            onClick={() => setMode("compare")}
            className="min-w-[150px]"
          >
            Compare Assets
          </Button>
        </div>

        {/* Asset Selector / Basket Builder / Comparison */}
        {mode === "single" && (
          <AssetSelector
            selectedAsset={selectedAsset}
            onAssetChange={setSelectedAsset}
            onDataLoad={setAssetData}
          />
        )}
        
        {mode === "basket" && (
          <BasketBuilder
            basketAssets={basketAssets}
            onBasketChange={setBasketAssets}
            onBasketDataLoad={setBasketData}
          />
        )}
        
        {mode === "compare" && (
          <MultiAssetComparison
            selectedAssets={comparisonAssets}
            onSelectionChange={setComparisonAssets}
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
        {mode === "compare" ? (
          <ComparisonChart 
            assetsData={comparisonData}
            selectedDate={selectedDate}
            viewMode={comparisonViewMode}
            onViewModeChange={setComparisonViewMode}
            startDate={startDate}
            endDate={endDate}
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="space-y-4">
              <AssetChart
                data={filteredData}
                assetName={mode === "basket" ? "Portfolio" : selectedAsset}
                selectedDate={selectedDate}
              />
              <DateSelector
                data={filteredData}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </div>

            {/* Insights Panel */}
            <div className="space-y-4">
              <InsightsPanel
                data={filteredData}
                assetName={mode === "basket" ? "Portfolio" : selectedAsset}
                selectedDate={selectedDate}
              />
              
              {/* Social Share */}
              <SocialShare
                basketAssets={basketAssets}
                isBasketMode={mode === "basket"}
                selectedAsset={selectedAsset}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Simulator;
