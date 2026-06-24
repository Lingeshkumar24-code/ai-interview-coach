import { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Search, Loader2, CalendarClock } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import GlassCard from "../components/GlassCard.jsx";
import { colorForScore } from "../components/ReadinessRing.jsx";
import { getAnalytics } from "../services/api.js";
import { useInterviewSession } from "../hooks/useInterviewSession.js";

const PIE_COLORS = ["#2563EB", "#06B6D4", "#8B5CF6", "#F59E0B"];

export default function AnalyticsPage() {
  const { session } = useInterviewSession();
  const [email, setEmail] = useState(session?.candidate?.email || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await getAnalytics(email.trim());
      setData(result);
    } catch (err) {
      setData(null);
      setError(
        err?.response?.data?.detail ||
          "No interview history found for this email yet. Complete a practice interview first."
      );
    } finally {
      setLoading(false);
    }
  };

  const trendData = data?.trend?.map((t, i) => ({
    name: `#${i + 1}`,
    score: Math.round(t.score),
    role: t.role,
  }));

  const barData = data?.past_interviews?.map((iv, i) => ({
    name: `#${i + 1}`,
    score: Math.round(iv.overall_score || 0),
    role: iv.role,
  }));

  const pieData = data
    ? [
        { name: "Technical", value: data.skill_distribution.technical },
        { name: "Communication", value: data.skill_distribution.communication },
        { name: "Problem Solving", value: data.skill_distribution.problem_solving },
        { name: "Confidence", value: data.skill_distribution.confidence },
      ]
    : [];

  return (
    <div className="min-h-screen bg-bg bg-grid-glow">
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="eyebrow">Progress Tracking</span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Your Analytics
          </h1>
          <p className="mt-2 text-muted">
            Look up your interview history and performance trend by email.
          </p>
        </motion.div>

        <form onSubmit={handleSearch} className="mt-8 flex gap-3">
          <input
            type="email"
            className="input-field"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn-primary shrink-0" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Look Up
          </button>
        </form>

        {error && (
          <div className="mt-5 rounded-xl border border-improve/40 bg-improve/10 px-4 py-3 text-sm text-improve">
            {error}
          </div>
        )}

        {data && (
          <div className="mt-8 space-y-6">
            {/* Past interviews table */}
            <GlassCard>
              <p className="eyebrow mb-4">Past Interviews</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-cardborder text-muted">
                      <th className="py-2 pr-4 font-mono text-xs uppercase">Date</th>
                      <th className="py-2 pr-4 font-mono text-xs uppercase">Role</th>
                      <th className="py-2 pr-4 font-mono text-xs uppercase">Difficulty</th>
                      <th className="py-2 pr-4 font-mono text-xs uppercase">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.past_interviews.map((iv) => (
                      <tr key={iv.id} className="border-b border-cardborder/40">
                        <td className="py-3 pr-4 text-muted">
                          <span className="flex items-center gap-1.5">
                            <CalendarClock size={14} />
                            {new Date(iv.date).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-ink">{iv.role}</td>
                        <td className="py-3 pr-4 text-muted">{iv.difficulty}</td>
                        <td className="py-3 pr-4">
                          <span
                            className="font-mono font-semibold"
                            style={{ color: colorForScore(iv.overall_score || 0) }}
                          >
                            {iv.overall_score != null ? Math.round(iv.overall_score) : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Trend line chart */}
            <GlassCard>
              <p className="eyebrow mb-4">Performance Trend</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid stroke="#2A3B52" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: "#1E293B", border: "1px solid #2A3B52", borderRadius: 8 }}
                      labelStyle={{ color: "#F8FAFC" }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#06B6D4" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Bar chart per interview */}
            <GlassCard>
              <p className="eyebrow mb-4">Score by Session</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid stroke="#2A3B52" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: "#1E293B", border: "1px solid #2A3B52", borderRadius: 8 }}
                      labelStyle={{ color: "#F8FAFC" }}
                    />
                    <Bar dataKey="score" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Skill distribution pie */}
            <GlassCard>
              <p className="eyebrow mb-4">Skill Distribution (Average)</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, value }) => `${name}: ${Math.round(value)}%`}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ color: "#94A3B8", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: "#1E293B", border: "1px solid #2A3B52", borderRadius: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        )}
      </section>
    </div>
  );
}
