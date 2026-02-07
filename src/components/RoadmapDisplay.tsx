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

interface RoadmapDisplayProps {
  roadmap: any;
  onReset: () => void;
}

export default function RoadmapDisplay({
  roadmap,
  onReset,
}: RoadmapDisplayProps) {
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-white mb-3">
            Your Personalized Learning Roadmap
          </h3>
          <p className="text-neutral-400 text-lg">{roadmap.summary}</p>

          {/* Timeline */}
          {roadmap.timeline && (
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-neutral-400">Beginner:</span>
                <span className="text-white font-medium">
                  {roadmap.timeline.beginner}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-neutral-400">With Basics:</span>
                <span className="text-white font-medium">
                  {roadmap.timeline.withBasics}
                </span>
              </div>
            </div>
          )}
        </div>
        <Button
          onClick={onReset}
          variant="outline"
          className="btn-secondary flex-shrink-0"
        >
          Start Over
        </Button>
      </div>

      {/* Learning Path */}
      {roadmap.learningPath && roadmap.learningPath.length > 0 && (
        <div className="space-y-6">
          <h4 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-400" />
            Learning Path
          </h4>

          {roadmap.learningPath.map((phase: any, phaseIndex: number) => (
            <div key={phaseIndex} className="glass-card p-6">
              {/* Phase Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h5 className="text-xl font-bold text-white mb-1">
                    {phase.phase}
                  </h5>
                  <p className="text-neutral-400 text-sm">
                    {phase.description}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
                  {phase.duration}
                </span>
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
                          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Learning Resources
                          </div>
                          {topic.resources.map(
                            (resource: any, resIndex: number) => (
                              <a
                                key={resIndex}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group border border-white/5"
                              >
                                <div className="text-blue-400">
                                  {getResourceIcon(resource.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                                      {resource.title}
                                    </span>
                                    {resource.isFree && (
                                      <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                                        Free
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                                    <span>{resource.platform}</span>
                                    {resource.duration && (
                                      <>
                                        <span>•</span>
                                        <span>{resource.duration}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-blue-400 transition-colors" />
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
                                        (skill: string, skillIdx: number) => (
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
          ))}
        </div>
      )}

      {/* Career Roadmap */}
      {roadmap.careerRoadmap && (
        <div className="space-y-4">
          <h4 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Career Progression
          </h4>

          <div className="grid md:grid-cols-3 gap-4">
            {["entryLevel", "midLevel", "senior"].map((level) => {
              const data = roadmap.careerRoadmap[level];
              if (!data) return null;

              return (
                <div key={level} className="glass-card p-5">
                  <h5 className="font-bold text-white mb-1">{data.title}</h5>
                  <div className="flex items-center gap-2 text-green-400 mb-3">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">{data.salary}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-neutral-500 uppercase">
                      Key Skills
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {data.skills &&
                        data.skills
                          .slice(0, 5)
                          .map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            >
                              {skill}
                            </span>
                          ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
