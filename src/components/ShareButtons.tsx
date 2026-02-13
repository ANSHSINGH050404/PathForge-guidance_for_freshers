"use client";

import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Facebook, Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface ShareButtonsProps {
  title: string;
  text: string;
  url?: string; // Optional, defaults to current window location
}

// Custom icons since Lucide might not have all brand icons or we want specific styling
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function ShareButtons({ title, text, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    if (typeof window !== "undefined") {
      return url || window.location.href;
    }
    return url || "";
  };

  const shareLinks = [
    {
      name: "X (Twitter)",
      icon: <XIcon className="w-4 h-4" />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text,
      )}&url=${encodeURIComponent(getUrl())}`,
      color: "hover:bg-black hover:text-white border-black/10",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-4 h-4" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        getUrl(),
      )}`,
      color: "hover:bg-[#0077b5] hover:text-white border-[#0077b5]/20",
    },
    {
      name: "Facebook",
      icon: <Facebook className="w-4 h-4" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        getUrl(),
      )}`,
      color: "hover:bg-[#1877F2] hover:text-white border-[#1877F2]/20",
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${text} ${getUrl()}`);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-neutral-400 mr-2">
        <Share2 className="w-4 h-4" />
        <span className="font-medium">Share Result:</span>
      </div>

      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2.5 rounded-full bg-white/5 border border-white/10 transition-all duration-300 hover:scale-110 ${link.color} text-neutral-400`}
          aria-label={`Share on ${link.name}`}
        >
          {link.icon}
        </a>
      ))}

      <button
        onClick={copyToClipboard}
        className="p-2.5 rounded-full bg-white/5 border border-white/10 transition-all duration-300 hover:scale-110 hover:bg-neutral-800 text-neutral-400 hover:text-white ml-1"
        aria-label="Copy link"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
