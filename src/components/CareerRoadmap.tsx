"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2, Briefcase, Code2, TrendingUp, Target, Lightbulb, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Skill {
  title: string;
  why: string;
  how: string;
}

interface SkillCategory {
  category: string;
  skills: Skill[];
}

interface JobOption {
  title: string;
  responsibilities: string;
  why: string;
}

interface RoadmapData {
  summary: string;
  jobOptions: JobOption[];
  skillsToLearn: SkillCategory[];
  learningApproach: {
    title: string;
    points: string[];
  };
}

// Sample roadmap data for frontend developers
const sampleRoadmap: RoadmapData = {
  summary: "Based on your frontend development skills, you're well-positioned for mid-level roles. Focus on deepening your React expertise and expanding into full-stack capabilities to unlock senior positions.",
  jobOptions: [
    {
      title: "Senior Frontend Engineer",
      responsibilities: "Lead frontend architecture decisions, mentor junior developers, and drive technical excellence in UI/UX implementation.",
      why: "Your React and TypeScript skills align perfectly with senior frontend roles requiring modern framework expertise.",
    },
    {
      title: "Full Stack Developer",
      responsibilities: "Build end-to-end features, work across frontend and backend systems, and contribute to API design.",
      why: "Adding backend skills to your frontend expertise makes you versatile for full-stack positions in high demand.",
    },
    {
      title: "Frontend Architect",
      responsibilities: "Design scalable frontend systems, establish coding standards, and evaluate new technologies.",
      why: "With strong fundamentals, you can move toward architectural roles that shape technical direction.",
    },
  ],
  skillsToLearn: [
    {
      category: "Deepen Frontend Expertise",
      skills: [
        {
          title: "Advanced React Patterns",
          why: "Understanding hooks, context, and performance optimization is crucial for senior roles.",
          how: "Build complex applications using custom hooks, lazy loading, and code splitting.",
        },
        {
          title: "System Design for Frontend",
          why: "Senior roles require architectural thinking about scalable UI systems.",
          how: "Study component architecture, state management patterns, and micro-frontends.",
        },
      ],
    },
    {
      category: "Expand to Full Stack",
      skills: [
        {
          title: "Node.js & Backend Basics",
          why: "Full-stack capabilities dramatically increase your career opportunities.",
          how: "Build REST APIs, understand database design, and learn authentication patterns.",
        },
        {
          title: "Cloud & DevOps",
          why: "Modern development requires deployment and infrastructure knowledge.",
          how: "Learn AWS basics, Docker, and CI/CD pipelines for automated deployments.",
        },
      ],
    },
    {
      category: "Leadership & Soft Skills",
      skills: [
        {
          title: "Code Review & Mentoring",
          why: "Senior roles involve elevating team quality through knowledge sharing.",
          how: "Practice giving constructive feedback, document best practices, and pair program.",
        },
        {
          title: "Technical Communication",
          why: "Explaining complex concepts clearly is essential for leadership.",
          how: "Write technical documentation, present at meetups, and contribute to open source.",
        },
      ],
    },
  ],
  learningApproach: {
    title: "Strategic Learning Path",
    points: [
      "Build portfolio projects that demonstrate advanced concepts",
      "Contribute to open source to collaborate with experienced developers",
      "Take on stretch assignments at work that push your boundaries",
      "Find a mentor who has achieved the role you're targeting",
      "Document your learnings through blog posts or talks",
    ],
  },
};

export default function CareerRoadmap() {
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript", "Next.js"]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [roadmap, setRoadmap] = useState<RoadmapData>(sampleRoadmap);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const text = await file.text();
      const skillsArray = text.split(",").map((skill) => skill.trim());
      setSkills(skillsArray);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to read skills from file";
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const generateRoadmap = async () => {
    if (skills.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: skills.join(", ") }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate roadmap");
      }

      const data = await response.json();
      setRoadmap(data);
      setShowResults(true);
    } catch (error) {
      console.error("Error generating roadmap:", error);
      // Keep showing sample data if API fails
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="roadmap" className="py-24 md:py-32 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-mono text-sm text-neutral-500 mb-4">Career Roadmap</h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Plan Your Growth
          </h3>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Enter your current skills to get a personalized career roadmap with 
            recommended roles, skills to learn, and actionable next steps.
          </p>
        </motion.div>

        {/* Skill Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
            {/* Drag and Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center mb-6 transition-all duration-300 ${
                dragActive
                  ? "border-white/40 bg-white/5"
                  : "border-white/10 hover:border-white/20"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt,.csv,text/plain"
                className="hidden"
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-neutral-400 animate-spin" />
                  <p className="text-neutral-400 font-mono">Analyzing your skills...</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-white text-lg mb-2">
                    Drag and drop your skills file here, or{" "}
                    <button
                      onClick={handleUploadClick}
                      className="text-white underline underline-offset-4 hover:text-neutral-300"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-neutral-500 text-sm font-mono">
                    Supports text files or manual entry
                  </p>
                </>
              )}
            </div>

            {uploadError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{uploadError}</p>
              </div>
            )}

            <label className="block text-sm font-mono text-neutral-400 mb-4">
              Your Skills
            </label>
            
            {/* Skill Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 text-white text-sm rounded-lg"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-neutral-400 hover:text-white"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Skill Input */}
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Node.js, AWS, GraphQL"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
              />
              <Button
                onClick={addSkill}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateRoadmap}
              disabled={skills.length === 0 || loading}
              className="w-full bg-white text-black hover:bg-neutral-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Career Roadmap"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {showResults && roadmap && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Summary */}
              <div className="max-w-3xl mx-auto mb-12 text-center">
                <p className="text-lg text-neutral-300">{roadmap.summary}</p>
              </div>

              {/* Job Options */}
              <div className="mb-12">
                <h4 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
                  <Briefcase className="w-5 h-5 text-neutral-400" />
                  Recommended Career Paths
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {roadmap.jobOptions.map((job, index) => (
                    <div
                      key={index}
                      className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <h5 className="text-white font-semibold mb-3">{job.title}</h5>
                      <p className="text-sm text-neutral-400 mb-4">{job.responsibilities}</p>
                      <p className="text-xs text-neutral-500 font-mono">{job.why}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills to Learn */}
              <div className="mb-12">
                <h4 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
                  <Code2 className="w-5 h-5 text-neutral-400" />
                  Skills to Develop
                </h4>
                <div className="space-y-6">
                  {roadmap.skillsToLearn.map((category, index) => (
                    <div
                      key={index}
                      className="p-6 rounded-xl bg-white/5 border border-white/10"
                    >
                      <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-neutral-400" />
                        {category.category}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.skills.map((skill, skillIndex) => (
                          <div
                            key={skillIndex}
                            className="p-4 rounded-lg bg-white/5 border border-white/5"
                          >
                            <h6 className="text-white font-medium text-sm mb-2">{skill.title}</h6>
                            <p className="text-xs text-neutral-400 mb-2">{skill.why}</p>
                            <p className="text-xs text-neutral-500 font-mono">{skill.how}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Approach */}
              <div>
                <h4 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
                  <Lightbulb className="w-5 h-5 text-neutral-400" />
                  {roadmap.learningApproach.title}
                </h4>
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <ul className="space-y-3">
                    {roadmap.learningApproach.points.map((point, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Target className="w-4 h-4 text-neutral-400 mt-1 flex-shrink-0" />
                        <span className="text-neutral-300">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}