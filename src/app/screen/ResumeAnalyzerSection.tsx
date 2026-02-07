"use client";

import { useState, useRef, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Loader2,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ResumeAnalysisModal = lazy(
  () => import("@/components/ResumeAnalysisModal"),
);

export default function ResumeAnalyzerSection() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      handleFile(droppedFile);
    } else {
      alert("Please upload a PDF file");
    }
  };

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsAnalyzing(true);

    // Simulate analysis (replace with actual API call)
    setTimeout(() => {
      setAnalysisResult({
        atsScore: 85,
        scoreBreakdown: {
          formatting: { score: 90, feedback: "Excellent formatting" },
          keywords: { score: 80, feedback: "Good keyword usage" },
          structure: { score: 85, feedback: "Well-structured" },
          readability: { score: 88, feedback: "Easy to read" },
        },
        suggestions: [
          {
            category: "Keywords",
            issue: "Missing industry-specific terms",
            recommendation: "Add more technical keywords",
            priority: "high",
          },
        ],
        strengths: ["Clear formatting", "Good use of action verbs"],
        summary: "Your resume is well-optimized for ATS systems",
      });
      setIsAnalyzing(false);
      setShowModal(true);
    }, 2000);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  return (
    <section id="analyzer" className="relative section-padding overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
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
            <FileText className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-neutral-300">
              ATS Resume Analyzer
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Optimize Your Resume
            <br />
            <span className="gradient-text-primary">Beat the ATS</span>
          </h2>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Upload your resume and get instant AI-powered feedback on ATS
            compatibility, formatting, and content optimization.
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleUploadClick}
            className={`glass-card p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-500/10 scale-105"
                : "hover:bg-white/10"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {isAnalyzing ? (
              <div className="py-8">
                <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Analyzing Your Resume...
                </h3>
                <p className="text-neutral-400">
                  Our AI is reviewing your resume for ATS compatibility
                </p>
              </div>
            ) : file ? (
              <div className="py-8">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {file.name}
                </h3>
                <p className="text-neutral-400 mb-4">
                  File uploaded successfully
                </p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  variant="outline"
                  className="btn-secondary"
                >
                  Upload Different File
                </Button>
              </div>
            ) : (
              <div className="py-8">
                <Upload className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Drop your resume here
                </h3>
                <p className="text-neutral-400 mb-6">
                  or click to browse • PDF only • Max 10MB
                </p>
                <Button className="btn-primary">
                  <Upload className="w-5 h-5 mr-2" />
                  Choose File
                </Button>
              </div>
            )}
          </div>

          {/* Features List */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {[
              {
                icon: CheckCircle2,
                title: "ATS Score",
                description: "Get a compatibility score out of 100",
              },
              {
                icon: AlertCircle,
                title: "Detailed Feedback",
                description: "Actionable suggestions to improve",
              },
              {
                icon: FileText,
                title: "Instant Results",
                description: "Analysis completed in seconds",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="glass-card p-4 flex items-start gap-3"
              >
                <feature.icon className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-white text-sm mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Analysis Modal */}
      {showModal && analysisResult && (
        <Suspense fallback={<div>Loading...</div>}>
          <ResumeAnalysisModal
            analysisResult={analysisResult}
            onClose={() => setShowModal(false)}
          />
        </Suspense>
      )}
    </section>
  );
}
