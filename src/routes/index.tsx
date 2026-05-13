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
  head: () => ({
    meta: [
      { title: "Redstream Foundation — Emergency Blood Donors in Delhi NCR" },
      {
        name: "description",
        content:
          "Redstream Foundation is a Delhi non-profit that coordinates verified emergency blood donations 24/7 by matching patients with nearby volunteer donors.",
      },
      { property: "og:title", content: "Redstream Foundation — Emergency Blood Donors in Delhi NCR" },
      {
        property: "og:description",
        content:
          "Verified, NGO-led emergency blood coordination across Delhi NCR. Request blood or join the donor network.",
      },
      { property: "og:url", content: "https://redstreamfoundation.lovable.app/" },
      { property: "og:image", content: "https://redstreamfoundation.lovable.app/og/home.jpg" },
      { name: "twitter:image", content: "https://redstreamfoundation.lovable.app/og/home.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://redstreamfoundation.lovable.app/" }],
  }),
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
