import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { ImpactMetrics } from "@/components/landing/ImpactMetrics";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyRedstream } from "@/components/landing/WhyRedstream";
import { LiveActivityFeed } from "@/components/landing/LiveActivityFeed";
import { TrustVerification } from "@/components/landing/TrustVerification";
import { EmergencyCTA } from "@/components/landing/EmergencyCTA";
import { Footer } from "@/components/landing/Footer";
import { DelhiTicker } from "@/components/landing/DelhiTicker";
import { MatchingWave } from "@/components/landing/MatchingWave";
import { CoverageMap } from "@/components/landing/CoverageMap";
import { ImpactStories } from "@/components/landing/ImpactStories";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground page-fade">
      <Nav />
      <main>
        <Hero />
        <DelhiTicker />
        <ImpactMetrics />
        <HowItWorks />
        <MatchingWave />
        <WhyRedstream />
        <LiveActivityFeed />
        <CoverageMap />
        <ImpactStories />
        <TrustVerification />
        <EmergencyCTA />
      </main>
      <Footer />
    </div>
  );
}
