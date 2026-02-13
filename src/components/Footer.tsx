"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  ArrowRight,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const footerLinks = {
  product: [
    { label: "Resume Analyzer", href: "#analyzer" },
    { label: "Career Roadmap", href: "#roadmap" },
    { label: "Features", href: "#features" },
  ],
  company: [
    { label: "About", href: "#about" },
    { label: "Blog", href: "#blog" },
    { label: "Contact", href: "#contact" },
  ],
  resources: [
    { label: "Documentation", href: "#docs" },
    { label: "Support", href: "#support" },
    { label: "Community", href: "#community" },
  ],
};

const socialLinks = [
  { icon: Github, href: "https://github.com/ANSHSINGH050404", label: "GitHub" },
  { icon: Twitter, href: "https://x.com/AnshSin18258375", label: "Twitter" },
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/ansh-singh-b56612241",
    label: "LinkedIn",
  },
  { icon: Mail, href: "mailto:anshsinghapa@gmail.com", label: "Email" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-black overflow-hidden pt-20 pb-10">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Image
                  src="/logo.jpeg"
                  alt="PathForge Logo"
                  width={48}
                  height={48}
                  className="rounded-xl shadow-lg shadow-blue-500/10 relative z-10"
                />
              </motion.div>
              <span className="font-mono text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-400 group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-500">
                PathForge
              </span>
            </Link>

            <p className="text-neutral-400 max-w-sm leading-relaxed text-sm">
              Empowering software engineers with AI-driven career guidance.
              Build your resume, plan your roadmap, and forge your path to
              excellence.
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg shadow-black/20"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-4">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="font-semibold text-white capitalize mb-6">
                  {category}
                </h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
                      >
                        <span className="relative">
                          {link.label}
                          <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 transition-all duration-300 group-hover:w-full" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter / Bottom Section */}
        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-neutral-500">
              <p>© {currentYear} PathForge. All rights reserved.</p>
              <div className="hidden md:block w-1 h-1 rounded-full bg-neutral-700" />
              <div className="flex gap-6">
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-neutral-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <span>Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              </motion.div>
              <span>by Ansh Singh</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
