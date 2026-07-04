import { WheelsDownApp } from "@/components/WheelsDownApp";
import { getProvider } from "@/lib/providers";

export default function Home() {
  return <WheelsDownApp demoMode={!getProvider().isLive} />;
}
