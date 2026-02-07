"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTA() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative section-padding overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card p-12 md:p-16 text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-neutral-300">
              Ready to Get Started?
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Start Forging Your
            <br />
            <span className="gradient-text-primary">Career Path Today</span>
          </h2>

          {/* Description */}
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10">
            Join thousands of engineers who've accelerated their careers with
            AI-powered resume analysis and personalized roadmaps.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => scrollToSection("analyzer")}
              className="btn-primary px-8 py-6 text-base font-medium rounded-full shadow-lg shadow-blue-500/20"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Analyze Your Resume
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("roadmap")}
              className="btn-secondary px-8 py-6 text-base font-medium rounded-full"
            >
              Get Career Roadmap
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-neutral-500 mb-4">
              Trusted by engineers at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
              <span className="text-2xl font-bold text-white">Google</span>
              <span className="text-2xl font-bold text-white">Meta</span>
              <span className="text-2xl font-bold text-white">Amazon</span>
              <span className="text-2xl font-bold text-white">Microsoft</span>
              <span className="text-2xl font-bold text-white">Netflix</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
