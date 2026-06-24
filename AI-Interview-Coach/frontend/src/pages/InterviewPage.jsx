import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SkipForward, Send, Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import GlassCard from "../components/GlassCard.jsx";
import { useInterviewSession } from "../hooks/useInterviewSession.js";
import { submitAnswer } from "../services/api.js";

const MAX_CHARS = 4000;

export default function InterviewPage() {
  const navigate = useNavigate();
  const { session, updateSession } = useInterviewSession();
  const { interviewId, questions, currentIndex = 0, answers = {} } = session;

  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!interviewId || !questions?.length) {
      navigate("/setup");
    }
  }, [interviewId, questions, navigate]);

  if (!interviewId || !questions?.length) return null;

  const total = questions.length;
  const current = questions[currentIndex];
  const progressPct = ((currentIndex) / total) * 100;
  const charCount = answerText.length;

  const advance = () => {
    setAnswerText("");
    setEvaluation(null);
    setError("");
    if (currentIndex + 1 >= total) {
      navigate("/results");
    } else {
      updateSession({ currentIndex: currentIndex + 1 });
    }
  };

  const handleSubmit = async (skipped = false) => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await submitAnswer({
        interview_id: interviewId,
        question_id: current.question_id || current.id,
        answer_text: skipped ? "" : answerText,
        skipped,
      });
      setEvaluation(result);
      updateSession({
        answers: { ...answers, [current.id]: { answerText, evaluation: result } },
      });
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Could not evaluate this answer. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg bg-grid-glow">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-12">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wide text-muted">
              Question {currentIndex + 1} of {total}
            </span>
            <span className="font-mono text-xs text-secondary">{current.category}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-cardborder">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35 }}
          >
            <GlassCard className="p-8">
              <h2 className="font-display text-xl font-semibold leading-snug md:text-2xl">
                {current.question}
              </h2>

              {!evaluation ? (
                <div className="mt-6">
                  <textarea
                    className="input-field min-h-[180px] resize-y leading-relaxed"
                    placeholder="Type your answer here..."
                    value={answerText}
                    maxLength={MAX_CHARS}
                    onChange={(e) => setAnswerText(e.target.value)}
                    disabled={submitting}
                  />
                  <div className="mt-2 flex justify-end">
                    <span className="font-mono text-xs text-muted">
                      {charCount} / {MAX_CHARS}
                    </span>
                  </div>

                  {error && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-beginner/40 bg-beginner/10 px-4 py-3 text-sm text-beginner">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleSubmit(true)}
                      disabled={submitting}
                      className="btn-secondary"
                    >
                      <SkipForward size={16} />
                      Skip
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubmit(false)}
                      disabled={submitting || !answerText.trim()}
                      className="btn-primary"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Submit Answer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <EvaluationResult evaluation={evaluation} onContinue={advance} isLast={currentIndex + 1 >= total} />
              )}
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}

function EvaluationResult({ evaluation, onContinue, isLast }) {
  const scores = [
    { label: "Technical", value: evaluation.technical_score },
    { label: "Depth", value: evaluation.depth_score },
    { label: "Clarity", value: evaluation.clarity_score },
    { label: "Problem Solving", value: evaluation.problem_solving_score },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6"
    >
      <div className="flex items-center gap-3 rounded-xl border border-cardborder bg-bg/40 px-5 py-4">
        <CheckCircle2 size={22} className="text-excellent" />
        <div>
          <p className="font-display text-lg font-bold">{Math.round(evaluation.overall_score)}/100</p>
          <p className="font-mono text-xs text-muted">Overall score for this answer</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {scores.map((s) => (
          <div key={s.label} className="rounded-xl bg-bg/40 p-3 text-center">
            <p className="font-display text-lg font-bold text-secondary">{s.value}/10</p>
            <p className="font-mono text-[11px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <FeedbackList title="Strengths" items={evaluation.strengths} tone="excellent" />
        <FeedbackList title="Weaknesses" items={evaluation.weaknesses} tone="beginner" />
      </div>
      <FeedbackList title="Improvements" items={evaluation.improvements} tone="improve" className="mt-4" />

      <div className="mt-5 rounded-xl border border-cardborder bg-bg/40 p-4">
        <p className="eyebrow mb-2">Ideal Answer</p>
        <p className="text-sm leading-relaxed text-muted">{evaluation.ideal_answer}</p>
      </div>

      <button type="button" onClick={onContinue} className="btn-primary mt-6 w-full">
        {isLast ? "View Final Report" : "Next Question"}
        <ArrowRight size={18} />
      </button>
    </motion.div>
  );
}

function FeedbackList({ title, items, tone, className = "" }) {
  const colorMap = { excellent: "text-excellent", beginner: "text-beginner", improve: "text-improve" };
  return (
    <div className={`rounded-xl bg-bg/40 p-4 ${className}`}>
      <p className={`font-display text-sm font-semibold ${colorMap[tone]}`}>{title}</p>
      <ul className="mt-2 space-y-1.5">
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
