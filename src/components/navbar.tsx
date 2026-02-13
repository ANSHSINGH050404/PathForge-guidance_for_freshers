"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import Image from "next/image";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#analyzer", label: "Resume Analysis" },
  { href: "#roadmap", label: "Career Roadmap" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const { data: session, isPending } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed w-full z-50 top-0 transition-all duration-500 border-b",
        scrolled
          ? "h-16 bg-black/60 backdrop-blur-xl border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
          : "h-20 bg-transparent border-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex h-full items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Image
                src="/logo.jpeg"
                alt="PathForge Logo"
                width={40}
                height={40}
                className="rounded-xl shadow-lg shadow-blue-500/10 relative z-10 text-transparent"
              />
            </motion.div>
            <span className="font-mono text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-400 group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-500">
              PathForge
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <nav className="flex items-center bg-white/5 rounded-full px-2 py-1 border border-white/5 backdrop-blur-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHoveredPath(link.href)}
                  onMouseLeave={() => setHoveredPath(null)}
                  className="relative px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  <span className="relative z-10">{link.label}</span>
                  {hoveredPath === link.href && (
                    <motion.div
                      layoutId="navbar-glow"
                      className="absolute inset-0 bg-white/10 rounded-full -z-0"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="h-6 w-px bg-white/10 mx-6" />

            {isPending ? (
              <Loader2 className="h-5 w-5 text-neutral-400 animate-spin" />
            ) : session?.user ? (
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => signOut()}
                  className="text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  Sign Out
                </Button>
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px]">
                  <div className="h-full w-full rounded-full bg-black flex items-center justify-center text-xs font-bold text-white">
                    {session.user.name?.charAt(0) || "U"}
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login">
                <Button className="relative group overflow-hidden bg-white/5 text-white hover:text-white border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300">
                    Sign In
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-4 group-hover:ml-0" />
                  </span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 text-white/80 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-all text-neutral-300 hover:text-white group"
                  >
                    <span className="font-medium">{link.label}</span>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-white/50" />
                  </Link>
                </motion.div>
              ))}

              <div className="h-px bg-white/10 my-4" />

              {!isPending && !session?.user && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:scale-[1.02] transition-transform duration-300 border-0">
                      Sign In Now
                    </Button>
                  </Link>
                </motion.div>
              )}

              {!isPending && session?.user && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px]">
                      <div className="h-full w-full rounded-full bg-black flex items-center justify-center text-sm font-bold text-white">
                        {session.user.name?.charAt(0) || "U"}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">
                        {session.user.name}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {session.user.email}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="w-full text-neutral-400 hover:text-red-400 hover:bg-white/5 justify-start px-3"
                  >
                    Log Out
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
