import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  PlayCircle,
  Brain,
  LineChart,
  FileText,
  Layers,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import GlassCard from "../components/GlassCard.jsx";
import ReadinessRing from "../components/ReadinessRing.jsx";

const FEATURES = [
  {
    icon: Brain,
    title: "Role-specific questions",
    desc: "Five targeted questions generated per session — covering theory, tools, and real-world scenarios for your exact role.",
  },
  {
    icon: CheckCircle2,
    title: "Instant AI evaluation",
    desc: "Every answer is scored on accuracy, depth, clarity, and problem-solving, with concrete strengths and gaps.",
  },
  {
    icon: Layers,
    title: "Ideal answer playback",
    desc: "See a model answer after every question, so you always know what 'great' looks like for that exact prompt.",
  },
  {
    icon: FileText,
    title: "Resume-aware practice",
    desc: "Upload your resume and get questions personalized to your actual projects, skills, and experience.",
  },
  {
    icon: LineChart,
    title: "Progress analytics",
    desc: "Track your readiness score across sessions and see exactly which skill areas are improving.",
  },
];

const STEPS = [
  { n: "01", title: "Pick a role", desc: "Choose your target role, experience level, and difficulty." },
  { n: "02", title: "Answer 5 questions", desc: "Respond at your own pace with a focused, distraction-free interface." },
  { n: "03", title: "Get your readiness score", desc: "Receive a full breakdown with strengths, gaps, and an action plan." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg bg-grid-glow overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28">
        {/* floating decorative elements */}
        <motion.div
          className="absolute -top-10 right-[8%] hidden h-24 w-24 rounded-2xl border border-cardborder bg-card/40 backdrop-blur-md md:block"
          animate={{ y: [0, -16, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 left-[4%] hidden h-16 w-16 rounded-full border border-secondary/40 bg-secondary/10 md:block"
          animate={{ y: [0, 18, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="grid items-center gap-14 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <motion.span
              className="eyebrow mb-5 inline-block"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              POWERED BY OPEN-SOURCE AI · QWEN3
            </motion.span>

            <motion.h1
              className="font-display text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
            >
              Ace Your Dream{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Interview
              </span>{" "}
              With AI
            </motion.h1>

            <motion.p
              className="mt-6 max-w-lg text-lg text-muted"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Practice role-based interviews, receive instant AI feedback, and improve your
              hiring chances.
            </motion.p>

            <motion.div
              className="mt-9 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <Link to="/setup" className="btn-primary">
                Start Interview
                <ArrowRight size={18} />
              </Link>
              <Link to="/setup?demo=1" className="btn-secondary">
                <PlayCircle size={18} />
                View Demo
              </Link>
            </motion.div>

            <motion.div
              className="mt-10 flex items-center gap-6 text-sm text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span className="font-mono">100% open-source LLM</span>
              <span className="h-1 w-1 rounded-full bg-cardborder" />
              <span className="font-mono">No data leaves your server</span>
            </motion.div>
          </div>

          {/* Signature element: live readiness ring preview */}
          <motion.div
            className="relative mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <GlassCard className="relative flex flex-col items-center gap-5 p-8">
              <span className="eyebrow">Sample Readiness Report</span>
              <ReadinessRing score={87} size={180} label="Readiness" sublabel="Ready" />
              <div className="grid w-full grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-bg/50 p-3">
                  <p className="font-display text-xl font-bold text-secondary">8.4</p>
                  <p className="font-mono text-[11px] text-muted">Technical</p>
                </div>
                <div className="rounded-xl bg-bg/50 p-3">
                  <p className="font-display text-xl font-bold text-secondary">9.1</p>
                  <p className="font-mono text-[11px] text-muted">Clarity</p>
                </div>
              </div>
            </GlassCard>
            <motion.div
              className="absolute -bottom-6 -left-8 hidden rounded-xl border border-cardborder bg-card/80 px-4 py-2.5 backdrop-blur-md md:block"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="font-mono text-xs text-excellent">+12% vs last session</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-14 max-w-xl">
          <span className="eyebrow">What you get</span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Everything a real interview prep loop needs
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <GlassCard className="h-full transition-transform hover:-translate-y-1">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
                  <f.icon size={20} className="text-secondary" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-14 max-w-xl">
          <span className="eyebrow">The loop</span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Three steps to your readiness score
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative"
            >
              <span className="font-mono text-5xl font-bold text-cardborder">{s.n}</span>
              <h3 className="mt-3 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <GlassCard className="relative overflow-hidden text-center py-14">
          <div className="absolute inset-0 bg-grid-glow opacity-60" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Ready to find out where you stand?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted">
              Start a free practice interview and get your readiness score in minutes.
            </p>
            <Link to="/setup" className="btn-primary mt-8 inline-flex">
              Start Interview
              <ArrowRight size={18} />
            </Link>
          </div>
        </GlassCard>
      </section>

      <footer className="border-t border-cardborder/60 py-8 text-center font-mono text-xs text-muted">
        Built with open-source models · No cloud LLM dependency
      </footer>
    </div>
  );
}
