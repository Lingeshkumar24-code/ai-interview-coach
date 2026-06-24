import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { RotateCcw, Home, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import GlassCard from "../components/GlassCard.jsx";
import ReadinessRing, { colorForScore } from "../components/ReadinessRing.jsx";
import AnimatedCounter from "../components/AnimatedCounter.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { useInterviewSession } from "../hooks/useInterviewSession.js";
import { getFinalReport } from "../services/api.js";

export default function ResultsPage() {
  const navigate = useNavigate();
  const { session, clearSession } = useInterviewSession();
  const { interviewId } = session;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedIdx, setExpandedIdx] = useState(null);

  useEffect(() => {
    if (!interviewId) {
      navigate("/setup");
      return;
    }
    getFinalReport(interviewId)
      .then(setReport)
      .catch((err) =>
        setError(err?.response?.data?.detail || "Could not load the final report.")
      )
      .finally(() => setLoading(false));
  }, [interviewId]);

  const startOver = () => {
    clearSession();
    navigate("/setup");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg bg-grid-glow">
        <Navbar />
        <LoadingState message="Compiling your final report..." />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-bg bg-grid-glow">
        <Navbar />
        <div className="mx-auto max-w-md px-6 py-20 text-center">
          <p className="text-beginner">{error || "No report available."}</p>
          <button onClick={() => navigate("/setup")} className="btn-primary mt-6">
            Start a New Interview
          </button>
        </div>
      </div>
    );
  }

  const radarData = [
    { skill: "Technical", value: report.technical_score / 10 },
    { skill: "Communication", value: report.communication_score / 10 },
    { skill: "Problem Solving", value: report.problem_solving_score / 10 },
    { skill: "Confidence", value: report.confidence_score / 10 },
  ];

  const skillBars = [
    { label: "Technical Skill", value: report.technical_score, color: "#2563EB" },
    { label: "Communication", value: report.communication_score, color: "#06B6D4" },
    { label: "Problem Solving", value: report.problem_solving_score, color: "#8B5CF6" },
    { label: "Confidence", value: report.confidence_score, color: "#F59E0B" },
  ];

  return (
    <div className="min-h-screen bg-bg bg-grid-glow">
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="eyebrow">Final Report</span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Your Interview Readiness
          </h1>
          <p className="mt-2 text-muted">{report.role} · Practice Session</p>
        </motion.div>

        {/* Top summary: ring + skill bars */}
        <div className="mt-8 grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <GlassCard className="flex flex-col items-center justify-center gap-4 py-10">
            <ReadinessRing
              score={report.overall_score}
              size={210}
              label="Overall Score"
              sublabel={report.readiness_label}
            />
          </GlassCard>

          <GlassCard className="flex flex-col justify-center gap-5">
            {skillBars.map((bar, i) => (
              <div key={bar.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-display text-sm font-medium text-ink">{bar.label}</span>
                  <span className="font-mono text-sm" style={{ color: bar.color }}>
                    <AnimatedCounter value={bar.value} decimals={0} suffix="%" />
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-cardborder">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: bar.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.value}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Radar chart */}
        <GlassCard className="mt-6">
          <p className="eyebrow mb-4">Skill Radar</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#2A3B52" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "#94A3B8", fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 10]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#06B6D4"
                  fill="#06B6D4"
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Per-question breakdown */}
        <div className="mt-8">
          <p className="eyebrow mb-4">Question-by-Question Breakdown</p>
          <div className="space-y-3">
            {report.per_question.map((q, idx) => {
              const expanded = expandedIdx === idx;
              const scoreColor = colorForScore(q.overall_score);
              return (
                <GlassCard key={q.question_id} className="!p-0 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedIdx(expanded ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-muted">Q{q.order_index}</span>
                      <span className="font-display text-sm font-medium text-ink line-clamp-1">
                        {q.question}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-sm font-semibold" style={{ color: scoreColor }}>
                        {Math.round(q.overall_score)}/100
                      </span>
                      {expanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                    </div>
                  </button>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-cardborder/60 px-6 py-5"
                    >
                      <p className="font-mono text-xs uppercase tracking-wide text-secondary">{q.category}</p>
                      <p className="mt-2 text-sm text-muted">
                        <span className="font-semibold text-ink">Your answer: </span>
                        {q.skipped ? "Skipped" : q.answer}
                      </p>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <MiniList title="Strengths" items={q.strengths} />
                        <MiniList title="Weaknesses" items={q.weaknesses} />
                      </div>
                      <MiniList title="Improvements" items={q.improvements} className="mt-3" />
                      <div className="mt-3 rounded-lg bg-bg/50 p-3">
                        <p className="font-mono text-[11px] uppercase text-muted">Ideal Answer</p>
                        <p className="mt-1 text-sm text-muted">{q.ideal_answer}</p>
                      </div>
                    </motion.div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <button onClick={startOver} className="btn-primary">
            <RotateCcw size={16} />
            Practice Again
          </button>
          <button onClick={() => navigate("/")} className="btn-secondary">
            <Home size={16} />
            Back to Home
          </button>
        </div>
      </section>
    </div>
  );
}

function MiniList({ title, items, className = "" }) {
  return (
    <div className={className}>
      <p className="font-mono text-[11px] uppercase text-muted">{title}</p>
      <ul className="mt-1 space-y-1">
        {items?.length ? (
          items.map((item, idx) => (
            <li key={idx} className="text-sm text-muted">
              • {item}
            </li>
          ))
        ) : (
          <li className="text-sm text-muted">—</li>
        )}
      </ul>
    </div>
  );
}
