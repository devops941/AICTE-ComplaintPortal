import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureCards from "@/components/FeatureCards";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between overflow-x-hidden bg-gradient-to-br from-[#f8faff] via-[#f0f4fc] to-[#e8f0fa] text-slate-800 font-sans selection:bg-[#1e40af] selection:text-white">
      {/* Header Navigation */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col justify-center">
        <Hero />
        <FeatureCards />
      </main>

      {/* Clean Minimal Footer */}
      <Footer />
    </div>
  );
}
