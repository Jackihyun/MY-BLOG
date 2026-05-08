import AboutShowcase from "@/components/about/AboutShowcase";
import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 -mt-32 -mb-20">
      <AboutShowcase />
    </div>
  );
}
