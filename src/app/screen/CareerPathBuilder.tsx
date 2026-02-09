"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Check,
  Sparkles,
  ArrowLeft,
  Lock,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RoadmapDisplay from "@/components/RoadmapDisplay";
import axios from "axios";

// Career paths data
const careerPaths = [
  { id: "backend", label: "Backend Engineer", icon: "🔧" },
  { id: "frontend", label: "Frontend Engineer", icon: "🎨" },
  { id: "fullstack", label: "Full Stack Engineer", icon: "⚡" },
  { id: "devops", label: "DevOps Engineer", icon: "🚀" },
  { id: "mobile", label: "Mobile Developer", icon: "📱" },
  { id: "data", label: "Data Engineer", icon: "📊" },
];

// Tech stack options based on career path
const techStackOptions: Record<string, any> = {
  backend: {
    languages: [
      { id: "nodejs", label: "Node.js", icon: "🟢" },
      { id: "python", label: "Python", icon: "🐍" },
      { id: "java", label: "Java", icon: "☕" },
      { id: "go", label: "Go", icon: "🔵" },
      { id: "rust", label: "Rust", icon: "🦀" },
      { id: "csharp", label: "C#", icon: "💜" },
    ],
    databases: [
      { id: "postgresql", label: "PostgreSQL", icon: "🐘" },
      { id: "mongodb", label: "MongoDB", icon: "🍃" },
      { id: "mysql", label: "MySQL", icon: "🐬" },
      { id: "redis", label: "Redis", icon: "🔴" },
      { id: "dynamodb", label: "DynamoDB", icon: "⚡" },
    ],
    frameworks: [
      { id: "express", label: "Express.js", icon: "🚂" },
      { id: "fastapi", label: "FastAPI", icon: "⚡" },
      { id: "spring", label: "Spring Boot", icon: "🌱" },
      { id: "django", label: "Django", icon: "🎸" },
      { id: "nestjs", label: "NestJS", icon: "🐱" },
    ],
  },
  frontend: {
    languages: [
      { id: "react", label: "React", icon: "⚛️" },
      { id: "vue", label: "Vue.js", icon: "💚" },
      { id: "angular", label: "Angular", icon: "🅰️" },
      { id: "svelte", label: "Svelte", icon: "🔥" },
      { id: "nextjs", label: "Next.js", icon: "▲" },
    ],
    styling: [
      { id: "tailwind", label: "Tailwind CSS", icon: "🎨" },
      { id: "styled", label: "Styled Components", icon: "💅" },
      { id: "sass", label: "Sass/SCSS", icon: "🎀" },
      { id: "css-modules", label: "CSS Modules", icon: "📦" },
    ],
    tools: [
      { id: "typescript", label: "TypeScript", icon: "🔷" },
      { id: "webpack", label: "Webpack", icon: "📦" },
      { id: "vite", label: "Vite", icon: "⚡" },
      { id: "testing", label: "Jest/Vitest", icon: "🧪" },
    ],
  },
  fullstack: {
    frontend: [
      { id: "react", label: "React", icon: "⚛️" },
      { id: "nextjs", label: "Next.js", icon: "▲" },
      { id: "vue", label: "Vue.js", icon: "💚" },
    ],
    backend: [
      { id: "nodejs", label: "Node.js", icon: "🟢" },
      { id: "python", label: "Python", icon: "🐍" },
      { id: "java", label: "Java", icon: "☕" },
    ],
    databases: [
      { id: "postgresql", label: "PostgreSQL", icon: "🐘" },
      { id: "mongodb", label: "MongoDB", icon: "🍃" },
      { id: "mysql", label: "MySQL", icon: "🐬" },
    ],
  },
  devops: {
    cloud: [
      { id: "aws", label: "AWS", icon: "☁️" },
      { id: "azure", label: "Azure", icon: "🔷" },
      { id: "gcp", label: "Google Cloud", icon: "🌐" },
    ],
    containers: [
      { id: "docker", label: "Docker", icon: "🐳" },
      { id: "kubernetes", label: "Kubernetes", icon: "☸️" },
    ],
    cicd: [
      { id: "github-actions", label: "GitHub Actions", icon: "🔄" },
      { id: "jenkins", label: "Jenkins", icon: "🔧" },
      { id: "gitlab-ci", label: "GitLab CI", icon: "🦊" },
    ],
  },
  mobile: {
    platform: [
      { id: "react-native", label: "React Native", icon: "⚛️" },
      { id: "flutter", label: "Flutter", icon: "🦋" },
      { id: "swift", label: "Swift (iOS)", icon: "🍎" },
      { id: "kotlin", label: "Kotlin (Android)", icon: "🤖" },
    ],
    tools: [
      { id: "expo", label: "Expo", icon: "📱" },
      { id: "firebase", label: "Firebase", icon: "🔥" },
    ],
  },
  data: {
    languages: [
      { id: "python", label: "Python", icon: "🐍" },
      { id: "scala", label: "Scala", icon: "🔴" },
      { id: "sql", label: "SQL", icon: "🗃️" },
    ],
    tools: [
      { id: "spark", label: "Apache Spark", icon: "⚡" },
      { id: "airflow", label: "Apache Airflow", icon: "🌊" },
      { id: "kafka", label: "Apache Kafka", icon: "📨" },
    ],
    databases: [
      { id: "snowflake", label: "Snowflake", icon: "❄️" },
      { id: "bigquery", label: "BigQuery", icon: "📊" },
      { id: "redshift", label: "Redshift", icon: "🔴" },
    ],
  },
};

export default function CareerPathBuilder() {
  const [step, setStep] = useState(0);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  const FREE_TRIAL_LIMIT = 3; // Allow 3 free roadmap generations

  // Check authentication and usage on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get("/api/auth/status");
        setIsAuthenticated(data.isAuthenticated);
        // Set usage count from server response (database is source of truth)
        if (!data.isAuthenticated && data.usage) {
          setUsageCount(data.usage.careerPath || 0);
        }
      } catch (error) {
        console.error("Failed to check auth status:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const currentPathOptions = selectedPath
    ? techStackOptions[selectedPath]
    : null;
  const optionKeys = currentPathOptions ? Object.keys(currentPathOptions) : [];
  const currentStepKey = optionKeys[step - 1];
  const currentOptions = currentStepKey
    ? currentPathOptions[currentStepKey]
    : [];

  const handlePathSelect = (pathId: string) => {
    setSelectedPath(pathId);
    setStep(1);
    setSelections({});
  };

  const handleOptionSelect = (optionId: string) => {
    const newSelections = { ...selections, [currentStepKey]: optionId };
    setSelections(newSelections);

    // Move to next step or generate roadmap
    if (step < optionKeys.length) {
      setStep(step + 1);
    } else {
      generateRoadmap(newSelections);
    }
  };

  const generateRoadmap = async (finalSelections: Record<string, string>) => {
    setLoading(true);
    try {
      // Check if user has exceeded free trial and is not authenticated
      if (!isAuthenticated && usageCount >= FREE_TRIAL_LIMIT) {
        setLoading(false);
        setShowLoginPrompt(true);
        return;
      }

      const careerPathLabel =
        careerPaths.find((p) => p.id === selectedPath)?.label || "";

      // Build tech stack object with labels
      const techStackWithLabels: Record<string, string> = {};
      Object.entries(finalSelections).forEach(([category, techId]) => {
        const option = currentPathOptions?.[category]?.find(
          (opt: any) => opt.id === techId,
        );
        techStackWithLabels[category] = option?.label || techId;
      });

      // Validate before sending
      if (!careerPathLabel) {
        throw new Error("Career path is required");
      }
      if (Object.keys(techStackWithLabels).length === 0) {
        throw new Error("At least one tech stack selection is required");
      }

      console.log("Sending request:", { careerPathLabel, techStackWithLabels });

      const { data } = await axios.post(
        "/api/career-path",
        {
          careerPath: careerPathLabel,
          techStack: techStackWithLabels,
        },
        {
          headers: {
            "x-careerPath-usage": usageCount.toString(),
          },
        },
      );

      if (process.env.NODE_ENV === "development") {
        console.log("Received API response:", data);
        console.log("Response keys:", Object.keys(data));
      }

      setRoadmap(data);

      if (process.env.NODE_ENV === "development") {
        console.log("Roadmap state set successfully");
      }

      // Update usage count from server response if available
      // The server increments usage, so we refresh the count
      if (!isAuthenticated) {
        // Refresh auth status to get updated usage count
        try {
          const { data: statusData } = await axios.get("/api/auth/status");
          if (statusData.usage) {
            setUsageCount(statusData.usage.careerPath || 0);
          }
        } catch (error) {
          console.error("Failed to refresh usage count:", error);
        }
      }
    } catch (error: any) {
      console.error("Error generating roadmap:", error);
      console.error("Error response:", error.response?.data);

      if (
        error.response?.status === 403 &&
        error.response?.data?.error === "Free trial limit exceeded"
      ) {
        setLoading(false);
        setShowLoginPrompt(true);
        return;
      }

      let errorMessage = "Failed to generate roadmap. Please try again.";
      if (error.response?.status === 400) {
        errorMessage = `Validation error: ${error.response.data.error || "Invalid request data"}`;
      } else if (error.response?.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      const newSelections = { ...selections };
      delete newSelections[optionKeys[step - 2]];
      setSelections(newSelections);
    } else if (step === 1) {
      setStep(0);
      setSelectedPath(null);
      setSelections({});
    }
  };

  const resetBuilder = () => {
    setStep(0);
    setSelectedPath(null);
    setSelections({});
    setRoadmap(null);
  };

  return (
    <section
      id="path-builder"
      className="relative section-padding overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Login Prompt Modal */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowLoginPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="glass-card p-8 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white text-center mb-3">
                Free Trial Exhausted
              </h3>
              <p className="text-neutral-400 text-center mb-6">
                You've used your free roadmap generation! Sign in to unlock
                unlimited access to personalized career roadmaps and more
                features.
              </p>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-300">
                    Unlimited roadmap generations
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-300">
                    Save and track your progress
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-300">
                    Access to premium resources
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => (window.location.href = "/login")}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold"
                >
                  Sign In / Sign Up
                </Button>
                <Button
                  onClick={() => setShowLoginPrompt(false)}
                  variant="ghost"
                  className="w-full text-neutral-400 hover:text-white"
                >
                  Maybe Later
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-neutral-300">
              Interactive Path Builder
            </span>
          </div>

          {/* Free Trial Indicator */}
          {!isAuthenticated && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm mb-4">
              {usageCount < FREE_TRIAL_LIMIT ? (
                <>
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">
                    {FREE_TRIAL_LIMIT - usageCount} free{" "}
                    {FREE_TRIAL_LIMIT - usageCount === 1
                      ? "generation"
                      : "generations"}{" "}
                    remaining
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-400">
                    Free trial used • Sign in for unlimited access
                  </span>
                </>
              )}
            </div>
          )}

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Build Your
            <br />
            <span className="gradient-text-primary">Custom Career Path</span>
          </h2>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Choose your desired role and tech stack to get a personalized
            learning roadmap
          </p>
        </motion.div>

        {/* Builder Card */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12">
            <AnimatePresence mode="wait">
              {!roadmap ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Progress Bar */}
                  {selectedPath && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-400">
                          Step {step} of {optionKeys.length}
                        </span>
                        <span className="text-sm text-neutral-400">
                          {Math.round((step / optionKeys.length) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(step / optionKeys.length) * 100}%`,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 0: Choose Career Path */}
                  {step === 0 && (
                    <>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        What do you want to become?
                      </h3>
                      <p className="text-neutral-400 mb-8">
                        Select your desired career path
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {careerPaths.map((path) => (
                          <button
                            key={path.id}
                            onClick={() => handlePathSelect(path.id)}
                            className="glass-card p-6 text-center hover:bg-white/10 transition-all group"
                          >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                              {path.icon}
                            </div>
                            <div className="font-semibold text-white text-sm">
                              {path.label}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Steps 1+: Choose Tech Stack */}
                  {step > 0 && step <= optionKeys.length && !loading && (
                    <>
                      <div className="flex items-center gap-3 mb-8">
                        <Button
                          onClick={handleBack}
                          variant="ghost"
                          size="sm"
                          className="text-neutral-400 hover:text-white"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-2 capitalize">
                        Choose your {currentStepKey}
                      </h3>
                      <p className="text-neutral-400 mb-8">
                        Select the technology you want to learn
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {currentOptions.map((option: any) => (
                          <button
                            key={option.id}
                            onClick={() => handleOptionSelect(option.id)}
                            className="glass-card p-6 text-center hover:bg-white/10 transition-all group"
                          >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                              {option.icon}
                            </div>
                            <div className="font-semibold text-white text-sm">
                              {option.label}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Loading State */}
                  {loading && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Generating Your Roadmap...
                      </h3>
                      <p className="text-neutral-400">
                        Creating a personalized learning path based on your
                        selections
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="roadmap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Debug: Show what we received */}
                  {process.env.NODE_ENV === "development" && (
                    <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-yellow-400 text-sm font-mono mb-2">
                        Debug: Roadmap data structure
                      </p>
                      <details className="text-xs text-neutral-400">
                        <summary className="cursor-pointer text-yellow-400 mb-2">
                          Click to view raw data
                        </summary>
                        <pre className="overflow-auto max-h-96 bg-black/50 p-2 rounded">
                          {JSON.stringify(roadmap, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}

                  {roadmap && typeof roadmap === "object" ? (
                    <RoadmapDisplay roadmap={roadmap} onReset={resetBuilder} />
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Error: Invalid Roadmap Data
                      </h3>
                      <p className="text-neutral-400 mb-4">
                        The roadmap data received is not in the expected format.
                      </p>
                      <Button onClick={resetBuilder} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
