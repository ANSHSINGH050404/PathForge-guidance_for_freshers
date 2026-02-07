"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle2, TrendingUp, Zap, Upload } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload Your Resume",
    description: "Simply drag and drop your PDF resume or click to browse",
    color: "blue",
  },
  {
    icon: Zap,
    title: "AI Analysis",
    description: "Our AI scans for ATS compatibility, keywords, and structure",
    color: "purple",
  },
  {
    icon: CheckCircle2,
    title: "Get Insights",
    description: "Receive detailed feedback and actionable recommendations",
    color: "green",
  },
  {
    icon: TrendingUp,
    title: "Improve & Succeed",
    description: "Apply suggestions and increase your interview chances",
    color: "cyan",
  },
];

const stats = [
  { label: "Average ATS Score Improvement", value: "+32%" },
  { label: "Interview Rate Increase", value: "2.5x" },
  { label: "Time to First Offer", value: "-40%" },
];

export default function Features() {
  return (
    <section className="relative section-padding overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-neutral-300">
              How It Works
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Your Path to Success
            <br />
            <span className="gradient-text-primary">Made Simple</span>
          </h2>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Our AI-powered platform analyzes your resume and provides
            personalized career guidance in minutes, not months.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 text-center group"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Proven Results
            </h3>
            <p className="text-neutral-400">
              Join thousands of engineers who've accelerated their careers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold gradient-text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
