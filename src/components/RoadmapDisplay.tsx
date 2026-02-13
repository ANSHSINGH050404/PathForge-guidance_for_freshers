"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Video,
  FileText,
  Code2,
  ExternalLink,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Award,
  Target,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareButtons from "./ShareButtons";

interface RoadmapDisplayProps {
  roadmap: any;
  onReset: () => void;
}

export default function RoadmapDisplay({
  roadmap,
  onReset,
}: RoadmapDisplayProps) {
  // Debug: Log the roadmap data structure
  if (process.env.NODE_ENV === "development") {
    console.log("RoadmapDisplay received data:", roadmap);
    console.log("Roadmap keys:", roadmap ? Object.keys(roadmap) : "null");
    console.log("Has learningPath?", roadmap?.learningPath);
    console.log("Has careerRoadmap?", roadmap?.careerRoadmap);
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "documentation":
        return <FileText className="w-4 h-4" />;
      case "course":
        return <BookOpen className="w-4 h-4" />;
      case "practice":
        return <Code2 className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "intermediate":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "advanced":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-neutral-400 bg-neutral-500/10 border-neutral-500/20";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Header with Gradient Background */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 border border-white/10 p-8"
      >
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 animate-pulse" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              {/* Success Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 backdrop-blur-sm mb-4"
              >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-medium text-green-400">
                  Roadmap Generated Successfully
                </span>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-bold mb-4"
              >
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Your Personalized Learning Roadmap
                </span>
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-neutral-300 text-lg leading-relaxed"
              >
                {roadmap.summary}
              </motion.p>

              {/* Timeline with enhanced design */}
              {roadmap.timeline && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-4 mt-6"
                >
                  <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Clock className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <span className="text-xs text-neutral-400 block">
                        Beginner Timeline
                      </span>
                      <span className="text-white font-semibold">
                        {roadmap.timeline.beginner}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Clock className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <span className="text-xs text-neutral-400 block">
                        With Basics
                      </span>
                      <span className="text-white font-semibold">
                        {roadmap.timeline.withBasics}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col items-end gap-4"
            >
              <Button
                onClick={onReset}
                variant="outline"
                className="btn-secondary flex-shrink-0 hover:scale-105 transition-transform"
              >
                Start Over
              </Button>

              <ShareButtons
                title="My Custom Career Roadmap"
                text={`I just generated my custom learning roadmap for becoming a ${roadmap.careerRoadmap?.entryLevel?.title || "Tech Professional"}! 🚀 Check out my path to mastery.`}
                url={typeof window !== "undefined" ? window.location.href : ""}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Learning Path */}
      {roadmap.learningPath && roadmap.learningPath.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Learning Path
            </h4>
          </div>

          <div className="space-y-6">
            {roadmap.learningPath.map((phase: any, phaseIndex: number) => (
              <motion.div
                key={phaseIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + phaseIndex * 0.1, duration: 0.5 }}
                className="relative group"
              >
                {/* Phase Number Badge */}
                <div className="absolute -left-4 top-6 z-10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform">
                    {phaseIndex + 1}
                  </div>
                </div>

                <div className="glass-card p-6 pl-12 hover:bg-white/5 transition-all duration-300 border-l-4 border-blue-500/50 hover:border-blue-500">
                  {/* Phase Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h5 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {phase.phase}
                      </h5>
                      <p className="text-neutral-400 text-sm leading-relaxed">
                        {phase.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 font-semibold text-sm">
                        {phase.duration}
                      </span>
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="space-y-4">
                    {phase.topics &&
                      phase.topics.map((topic: any, topicIndex: number) => (
                        <div
                          key={topicIndex}
                          className="bg-white/5 rounded-lg p-4 border border-white/5"
                        >
                          <h6 className="font-semibold text-white mb-2">
                            {topic.title}
                          </h6>
                          <p className="text-sm text-neutral-400 mb-4">
                            {topic.description}
                          </p>

                          {/* Resources */}
                          {topic.resources && topic.resources.length > 0 && (
                            <div className="space-y-2 mb-4">
                              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                                Learning Resources
                              </div>
                              {topic.resources.map(
                                (resource: any, resIndex: number) => (
                                  <a
                                    key={resIndex}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-white/5 to-white/0 hover:from-blue-500/10 hover:to-cyan-500/10 transition-all duration-300 group border border-white/5 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10"
                                  >
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all">
                                      {getResourceIcon(resource.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                                          {resource.title}
                                        </span>
                                        {resource.isFree && (
                                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 animate-pulse">
                                            Free
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                                        <span className="font-medium">
                                          {resource.platform}
                                        </span>
                                        {resource.duration && (
                                          <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                              <Clock className="w-3 h-3" />
                                              {resource.duration}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                                  </a>
                                ),
                              )}
                            </div>
                          )}

                          {/* Practice Projects */}
                          {topic.practiceProjects &&
                            topic.practiceProjects.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Practice Projects
                                </div>
                                {topic.practiceProjects.map(
                                  (project: any, projIndex: number) => (
                                    <div
                                      key={projIndex}
                                      className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <span className="font-medium text-white text-sm">
                                          {project.title}
                                        </span>
                                        <span
                                          className={`px-2 py-0.5 rounded text-xs border ${getDifficultyColor(project.difficulty)}`}
                                        >
                                          {project.difficulty}
                                        </span>
                                      </div>
                                      <p className="text-xs text-neutral-400 mb-2">
                                        {project.description}
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {project.skills &&
                                          project.skills.map(
                                            (
                                              skill: string,
                                              skillIdx: number,
                                            ) => (
                                              <span
                                                key={skillIdx}
                                                className="px-2 py-0.5 rounded text-xs bg-white/5 text-neutral-400"
                                              >
                                                {skill}
                                              </span>
                                            ),
                                          )}
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Career Roadmap */}
      {roadmap.careerRoadmap && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h4 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Career Progression
            </h4>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                key: "entryLevel",
                gradient: "from-blue-500/10 to-cyan-500/10",
                border: "border-blue-500/30",
              },
              {
                key: "midLevel",
                gradient: "from-purple-500/10 to-pink-500/10",
                border: "border-purple-500/30",
              },
              {
                key: "senior",
                gradient: "from-orange-500/10 to-red-500/10",
                border: "border-orange-500/30",
              },
            ].map((config, idx) => {
              const data = roadmap.careerRoadmap[config.key];
              if (!data) return null;

              return (
                <motion.div
                  key={config.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 + idx * 0.1, duration: 0.5 }}
                  className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${config.gradient} border ${config.border} p-6 hover:scale-105 transition-all duration-300 group`}
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10">
                    <h5 className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">
                      {data.title}
                    </h5>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 mb-4 w-fit">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-bold">
                        {data.salary}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Key Skills
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.skills &&
                          data.skills
                            .slice(0, 5)
                            .map((skill: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors"
                              >
                                {skill}
                              </span>
                            ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Best Practices */}
      {roadmap.bestPractices && roadmap.bestPractices.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            Best Practices
          </h4>

          <div className="grid md:grid-cols-3 gap-4">
            {roadmap.bestPractices.map((practice: any, idx: number) => (
              <div key={idx} className="glass-card p-5">
                <h5 className="font-semibold text-white mb-3">
                  {practice.category}
                </h5>
                <ul className="space-y-2">
                  {practice.tips &&
                    practice.tips.map((tip: string, tipIdx: number) => (
                      <li
                        key={tipIdx}
                        className="text-sm text-neutral-400 flex items-start gap-2"
                      >
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Resources */}
      {roadmap.communityResources && roadmap.communityResources.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Community & Support
          </h4>

          <div className="grid md:grid-cols-2 gap-3">
            {roadmap.communityResources.map((community: any, idx: number) => (
              <a
                key={idx}
                href={community.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold text-white group-hover:text-purple-400 transition-colors mb-1">
                      {community.name}
                    </h5>
                    <p className="text-sm text-neutral-400">
                      {community.description}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-purple-400 transition-colors flex-shrink-0 ml-2" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {roadmap.certifications && roadmap.certifications.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-400" />
            Recommended Certifications
          </h4>

          <div className="space-y-3">
            {roadmap.certifications.map((cert: any, idx: number) => (
              <a
                key={idx}
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 hover:bg-white/10 transition-colors group flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                      {cert.name}
                    </h5>
                    <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      {cert.cost}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mb-1">
                    {cert.provider}
                  </p>
                  <p className="text-sm text-neutral-400">{cert.value}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-yellow-400 transition-colors flex-shrink-0 ml-2" />
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
