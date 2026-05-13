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

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <ImpactMetrics />
        <HowItWorks />
        <WhyRedstream />
        <LiveActivityFeed />
        <TrustVerification />
        <EmergencyCTA />
      </main>
      <Footer />
    </div>
  );
}
