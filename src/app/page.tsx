"use client";

import Navbar from "@/components/navbar";
import ScrollProgress from "@/components/ScrollProgress";
import Footer from "@/components/Footer";
import Hero from "./screen/Hero";
import Features from "./screen/Features";
import CareerPathBuilder from "./screen/CareerPathBuilder";
import ResumeAnalyzerSection from "./screen/ResumeAnalyzerSection";
import CarrerGuid from "./screen/Carrer_Guide";
import Testimonials from "./screen/Testimonials";
import CTA from "./screen/CTA";

export default function Home() {
  return (
    <div className="relative">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <Features />
      <CareerPathBuilder />
      <ResumeAnalyzerSection />
      <CarrerGuid />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
