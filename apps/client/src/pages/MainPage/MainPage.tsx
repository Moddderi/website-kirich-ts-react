import { lazy, Suspense } from "react";
import { CATALOG_ENABLED } from "../../constants/features";
import { HeroSection } from "./sections/HeroSection";
import { StatsStrip } from "./sections/StatsStrip";
import { WaysSection } from "./sections/WaysSection";
import { WhySection } from "./sections/WhySection";
import { ProcessSection } from "./sections/ProcessSection";
import { AboutSection } from "./sections/AboutSection";
import { CtaSection } from "./sections/CtaSection";
import { StickyCta } from "./sections/StickyCta";

const FeaturedProducts = lazy(() => import("./FeaturedProducts"));

const MARQUEE_WORDS = [
  "Ballroom",
  "Bespoke",
  "Standard",
  "Latin",
  "Handmade",
  "Poltava",
];

export const MainPage = () => (
  <main className="flex-grow">
    <HeroSection />

    {/* Big outline/solid lettering ticker */}
    <div
      className="marquee overflow-hidden border-y border-stone-900/10 py-6"
      aria-hidden="true"
    >
      <div className="marquee-track flex items-center">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center">
            {MARQUEE_WORDS.map((word, i) => (
              <span
                key={`${dup}-${word}`}
                className="flex items-center font-display text-5xl font-medium italic tracking-tight sm:text-7xl"
              >
                <span
                  className={`px-8 sm:px-12 ${
                    i % 2 === 0 ? "text-stone-900" : "text-outline"
                  }`}
                >
                  {word}
                </span>
                <span className="h-2 w-2 rotate-45 bg-accent" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>

    <StatsStrip />
    <WaysSection />
    <WhySection />
    <ProcessSection />

    {CATALOG_ENABLED && (
      <Suspense fallback={null}>
        <FeaturedProducts />
      </Suspense>
    )}

    <AboutSection />
    <CtaSection />
    <StickyCta />
  </main>
);
