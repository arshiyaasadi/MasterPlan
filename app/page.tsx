import { SiteNav } from "@/components/site-nav";
import { HeroContent } from "@/components/hero-content";

export default function HomePage() {
  return (
    <div className="bg-white">
      <SiteNav />
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <HeroContent />
        </div>
      </div>
    </div>
  );
}
