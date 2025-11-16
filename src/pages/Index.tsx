import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Bitcoin, BarChart3, TrendingUp } from "lucide-react";
import roxomLogo from "@/assets/roxom-logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img src={roxomLogo} alt="Roxom" className="h-12 md:h-16" />
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                Change the Unit.
              </span>
              <br />
              <span className="text-foreground">Change the Reality.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Visualize the world priced in Bitcoin, not fiat.
              <br />
              See how traditional assets perform when measured in BTC.
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <Button
                size="lg"
                onClick={() => navigate("/simulator")}
                className="text-lg px-8 py-6 group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                Launch the Simulator
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bitcoin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Bitcoin-Denominated</h3>
            <p className="text-muted-foreground text-sm">
              View traditional assets priced in BTC instead of fiat currency, revealing true value dynamics.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group">
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Portfolio Builder</h3>
            <p className="text-muted-foreground text-sm">
              Create custom baskets of assets with weighted allocations to analyze combined performance.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Time Travel Analysis</h3>
            <p className="text-muted-foreground text-sm">
              Select any point in time to compare historical and projected future values in BTC terms.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground text-sm">
          <p>Outperform Traditional Assets with Roxom • LAMBDIC Simulator</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
