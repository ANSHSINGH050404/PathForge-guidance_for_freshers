"use client";

import { CarrerGuideResponse } from "../../../types";
import axios from "axios";
import { motion } from "framer-motion";
import { Sparkles, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LoginPromptModal from "@/components/LoginPromptModal";

const utils_services = "/api/career";

const CarrerGuid = () => {
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CarrerGuideResponse | null>(null);

  // Free trial state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const FREE_TRIAL_LIMIT = 2; // Limit from auth-middleware

  useEffect(() => {
    // Check auth
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    setIsAuthenticated(!!token);

    // Check usage
    const count = parseInt(localStorage.getItem("careerUsageCount") || "0", 10);
    setUsageCount(count);
  }, []);

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill)) {
      setSkills((prevSkills) => [...prevSkills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((prevSkills) =>
      prevSkills.filter((skill) => skill !== skillToRemove),
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const CarrerGuideResponse = async () => {
    if (skills.length === 0) {
      alert("Please enter at least one skill");
      return;
    }

    if (skills.length > 20) {
      alert("Maximum 20 skills allowed");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(`${utils_services}`, {
        skills: skills,
      });

      setResponse(data);
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { error?: string }; status?: number };
        message?: string;
      };

      let errorMessage = "Unknown error occurred";

      if (axiosError.response?.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (axiosError.response?.data?.error) {
        errorMessage = axiosError.response.data.error;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }

      alert("Error generating career guidance: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setSkills([]);
    setCurrentSkill("");
    setResponse(null);
    setOpen(false);
  };

  return (
    <section id="roadmap" className="relative section-padding overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
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
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-neutral-300">
              Personalized Career Roadmap
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Your Path to Success
          </h2>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Get AI-powered career guidance tailored to your unique skill set
          </p>
        </motion.div>

        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass-card p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to forge your path?
            </h3>
            <p className="text-neutral-400 mb-6">
              Share your skills and get personalized career recommendations
            </p>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary px-8 py-6 text-base font-medium rounded-full shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Career Guidance
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-black/95 border-white/10 backdrop-blur-xl">
                {!response ? (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-white">
                        Tell us About Your Skills
                      </DialogTitle>
                      <DialogDescription className="text-neutral-400">
                        Add your technical skills to receive personalized career
                        guidance
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-6 py-6">
                      {/* Input Section */}
                      <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-white">
                          Your Skills
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={currentSkill}
                            onChange={(e) => setCurrentSkill(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="e.g. React, Python, TypeScript..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-neutral-500"
                          />
                          <Button
                            onClick={addSkill}
                            type="button"
                            className="btn-secondary px-6"
                          >
                            Add
                          </Button>
                        </div>
                        <p className="text-xs text-neutral-500">
                          Press Enter to add • Maximum 20 skills
                        </p>
                      </div>

                      {/* Skills Display */}
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-lg border border-white/10">
                          {skills.map((skill) => (
                            <span
                              key={skill}
                              className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full text-sm font-medium group hover:bg-blue-500/20 transition-colors"
                            >
                              {skill}
                              <button
                                onClick={() => removeSkill(skill)}
                                className="hover:text-blue-100 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <Button
                        disabled={skills.length === 0 || loading}
                        className="btn-primary w-full py-6 text-base font-medium rounded-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={CarrerGuideResponse}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Generating Your Roadmap...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate Career Roadmap
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="py-6">
                    <DialogHeader className="mb-6">
                      <DialogTitle className="text-2xl font-bold text-white">
                        Your Personalized Career Path
                      </DialogTitle>
                      <DialogDescription className="text-neutral-400 text-base">
                        {response.summary}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-8">
                      {/* Job Options */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full" />
                          Recommended Job Roles
                        </h4>
                        <div className="space-y-3">
                          {response.jobOptions.map((job, index) => (
                            <div
                              key={index}
                              className="glass-card p-5 hover:bg-white/10 transition-colors"
                            >
                              <h5 className="font-semibold text-white text-lg mb-2">
                                {job.title}
                              </h5>
                              <p className="text-sm text-neutral-400 mb-3">
                                {job.responsibilities}
                              </p>
                              <p className="text-sm text-blue-400">
                                <span className="font-medium">
                                  Why this fits:
                                </span>{" "}
                                {job.why}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills to Learn */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full" />
                          Skills to Develop
                        </h4>
                        <div className="space-y-4">
                          {response.skillsToLearn.map((category, index) => (
                            <div key={index} className="glass-card p-5">
                              <h5 className="font-semibold text-white mb-3">
                                {category.category}
                              </h5>
                              <div className="space-y-3">
                                {category.skills.map((skill, skillIndex) => (
                                  <div
                                    key={skillIndex}
                                    className="bg-white/5 rounded-lg p-4 border border-white/5"
                                  >
                                    <span className="font-medium text-purple-400 block mb-2">
                                      {skill.title}
                                    </span>
                                    <p className="text-sm text-neutral-400 mb-2">
                                      {skill.why}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                      <span className="text-green-400 font-medium">
                                        How:
                                      </span>{" "}
                                      {skill.how}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Learning Approach */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          {response.learningApproach.title}
                        </h4>
                        <div className="glass-card p-5">
                          <ul className="space-y-3">
                            {response.learningApproach.points.map(
                              (point, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-neutral-300 flex items-start gap-3"
                                >
                                  <span className="text-green-400 mt-1">✓</span>
                                  <span>{point}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                      <Button
                        variant="outline"
                        className="flex-1 btn-secondary py-6"
                        onClick={() => setResponse(null)}
                      >
                        Start Over
                      </Button>
                      <Button
                        className="flex-1 btn-primary py-6"
                        onClick={resetDialog}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CarrerGuid;
