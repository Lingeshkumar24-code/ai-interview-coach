import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Upload, FileCheck2, X, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import GlassCard from "../components/GlassCard.jsx";
import { useInterviewSession } from "../hooks/useInterviewSession.js";
import { generateInterview, uploadResume } from "../services/api.js";

const ROLES = [
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "AI Engineer",
  "Python Developer",
  "Java Developer",
  "Full Stack Developer",
  "Cloud Engineer",
  "DevOps Engineer",
];

const EXPERIENCE_LEVELS = ["Fresher", "1-3 Years", "3-5 Years", "5+ Years"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "1";
  const { updateSession } = useInterviewSession();

  const [form, setForm] = useState({
    fullName: isDemo ? "Jordan Avery" : "",
    email: isDemo ? "jordan.avery@example.com" : "",
    targetRole: isDemo ? "Data Scientist" : "",
    experience: isDemo ? "1-3 Years" : "",
    difficulty: isDemo ? "Medium" : "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [resumeStatus, setResumeStatus] = useState("idle"); // idle | uploading | done | error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    setResumeStatus("uploading");
    setError("");
    try {
      const data = await uploadResume(file);
      setResumeData(data);
      setResumeStatus("done");
    } catch (err) {
      setResumeStatus("error");
      setError(
        err?.response?.data?.detail ||
          "Could not parse this resume. You can still continue without it."
      );
    }
  };

  const clearResume = () => {
    setResumeFile(null);
    setResumeData(null);
    setResumeStatus("idle");
  };

  const isValid =
    form.fullName.trim() && form.email.trim() && form.targetRole && form.experience && form.difficulty;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError("");

    const resumeText = resumeData
      ? [
          resumeData.extracted_experience,
          resumeData.extracted_skills?.length
            ? `Skills: ${resumeData.extracted_skills.join(", ")}`
            : "",
          resumeData.extracted_projects?.length
            ? `Projects: ${resumeData.extracted_projects.join(" | ")}`
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : null;

    try {
      const result = await generateInterview({
        full_name: form.fullName,
        email: form.email,
        target_role: form.targetRole,
        experience: form.experience,
        difficulty: form.difficulty,
        resume_text: resumeText,
      });

      updateSession({
        interviewId: result.interview_id,
        questions: result.questions,
        candidate: form,
        currentIndex: 0,
        answers: {},
      });

      navigate("/interview");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Something went wrong generating your interview. Please make sure the backend and Ollama are running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg bg-grid-glow">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="eyebrow">Step 1 of 2</span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Tell us who we're interviewing
          </h1>
          <p className="mt-2 text-muted">
            We'll generate 5 tailored questions for your target role in seconds.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard className="mt-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="label-text">Full Name</label>
                <input
                  className="input-field"
                  placeholder="e.g. Jordan Avery"
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  required
                />
              </div>
              <div>
                <label className="label-text">Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange("email")}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-text">Target Role</label>
              <select
                className="input-field"
                value={form.targetRole}
                onChange={handleChange("targetRole")}
                required
              >
                <option value="" disabled>
                  Select a role
                </option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="label-text">Experience</label>
                <select
                  className="input-field"
                  value={form.experience}
                  onChange={handleChange("experience")}
                  required
                >
                  <option value="" disabled>
                    Select experience
                  </option>
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-text">Interview Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setForm((prev) => ({ ...prev, difficulty: d }))}
                      className={`rounded-xl border px-3 py-3 font-display text-sm font-medium transition-colors ${
                        form.difficulty === d
                          ? "border-primary bg-primary/15 text-ink"
                          : "border-cardborder text-muted hover:border-secondary/60 hover:text-ink"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="label-text">Resume (optional) — personalizes your questions</label>
              {!resumeFile ? (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-cardborder bg-bg/40 px-6 py-8 text-center transition-colors hover:border-secondary/60">
                  <Upload size={22} className="text-muted" />
                  <span className="text-sm text-muted">Click to upload a PDF resume</span>
                  <input type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} />
                </label>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-cardborder bg-bg/40 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm">
                    {resumeStatus === "uploading" && <Loader2 size={16} className="animate-spin text-secondary" />}
                    {resumeStatus === "done" && <FileCheck2 size={16} className="text-excellent" />}
                    <span className="text-ink">{resumeFile.name}</span>
                    {resumeStatus === "done" && (
                      <span className="font-mono text-xs text-muted">
                        · {resumeData?.extracted_skills?.length || 0} skills found
                      </span>
                    )}
                  </div>
                  <button type="button" onClick={clearResume} className="text-muted hover:text-ink">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-beginner/40 bg-beginner/10 px-4 py-3 text-sm text-beginner">
                {error}
              </div>
            )}

            <button type="submit" disabled={!isValid || loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating Interview...
                </>
              ) : (
                <>
                  Generate Interview
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </GlassCard>
        </motion.form>
      </section>
    </div>
  );
}
