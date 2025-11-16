import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { BasketAsset } from "@/pages/Simulator";

interface SocialShareProps {
  basketAssets: BasketAsset[];
  isBasketMode: boolean;
  selectedAsset: string;
}

const SocialShare = ({ basketAssets, isBasketMode, selectedAsset }: SocialShareProps) => {
  const generateShareUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    
    if (isBasketMode && basketAssets.length > 0) {
      const assetsParam = basketAssets
        .map(a => `${a.name}:${a.weight}`)
        .join(',');
      return `${baseUrl}?mode=basket&assets=${encodeURIComponent(assetsParam)}`;
    } else {
      return `${baseUrl}?mode=single&asset=${selectedAsset}`;
    }
  };

  const getShareText = () => {
    if (isBasketMode && basketAssets.length > 0) {
      const assetsList = basketAssets.map(a => `${a.name} (${a.weight}%)`).join(', ');
      return `Check out my Bitcoin portfolio: ${assetsList} on Roxom BTC Simulator`;
    } else {
      return `Check out ${selectedAsset} priced in Bitcoin on Roxom BTC Simulator`;
    }
  };

  const copyLink = () => {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const shareOnTwitter = () => {
    const url = generateShareUrl();
    const text = getShareText();
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareOnLinkedIn = () => {
    const url = generateShareUrl();
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareOnReddit = () => {
    const url = generateShareUrl();
    const text = getShareText();
    window.open(
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Share This Portfolio</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={copyLink}
          className="flex items-center gap-2"
        >
          <LinkIcon className="h-4 w-4" />
          Copy Link
        </Button>
        
        <Button
          variant="outline"
          onClick={shareOnTwitter}
          className="flex items-center gap-2"
        >
          <Twitter className="h-4 w-4" />
          Twitter
        </Button>
        
        <Button
          variant="outline"
          onClick={shareOnLinkedIn}
          className="flex items-center gap-2"
        >
          <Linkedin className="h-4 w-4" />
          LinkedIn
        </Button>
        
        <Button
          variant="outline"
          onClick={shareOnReddit}
          className="flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
          </svg>
          Reddit
        </Button>
      </div>
    </Card>
  );
};

export default SocialShare;
