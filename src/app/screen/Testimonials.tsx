"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior Frontend Developer",
    company: "Google",
    image: "SC",
    content:
      "PathForge helped me identify gaps in my resume I never knew existed. After implementing their suggestions, I got 3x more interview calls!",
    rating: 5,
  },
  {
    name: "Michael Rodriguez",
    role: "Full Stack Engineer",
    company: "Meta",
    image: "MR",
    content:
      "The career roadmap feature is a game-changer. It gave me a clear path from mid-level to senior engineer with actionable steps.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "DevOps Engineer",
    company: "Amazon",
    image: "PS",
    content:
      "I was struggling to break into DevOps. PathForge's AI analyzed my skills and suggested the perfect learning path. Now I'm at my dream company!",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="relative section-padding overflow-hidden bg-gradient-to-b from-black to-neutral-950">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-neutral-300">
              Success Stories
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Loved by Engineers
            <br />
            <span className="gradient-text-purple">Worldwide</span>
          </h2>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            See how PathForge has helped thousands of engineers land their dream
            jobs
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 relative"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-purple-400/20 absolute top-4 right-4" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-neutral-300 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-neutral-400">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
