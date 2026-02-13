"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, ArrowUpRight } from "lucide-react";

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
  { icon: Linkedin, href: "https://www.linkedin.com/in/ansh-singh-b56612241", label: "LinkedIn" },
  { icon: Mail, href: "mailto:anshsinghapa@gmail.com", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">
          {/* Brand Column - Takes more space */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block mb-4">
              <span className="font-mono text-2xl font-bold text-white">
                PathForge
              </span>
            </Link>
            <p className="text-neutral-400 text-sm mb-6 max-w-sm leading-relaxed">
              AI-powered career guidance for software engineers. Forge your path
              to engineering excellence with intelligent resume analysis and
              personalized roadmaps.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:bg-white/10 transition-all group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns - Compact */}
          <div className="lg:col-span-7 grid grid-cols-3 gap-8">
            {/* Product Links */}
            <div>
              <h3 className="font-semibold text-white text-sm mb-4">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold text-white text-sm mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="font-semibold text-white text-sm mb-4">
                Resources
              </h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} PathForge. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <Link
              href="#privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link href="#terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link
              href="#cookies"
              className="hover:text-white transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
