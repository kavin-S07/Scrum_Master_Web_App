import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Users, BarChart3, CheckSquare, Calendar, Bell,
  ArrowRight, Star, Shield, Clock, Target, TrendingUp, GitBranch,
} from 'lucide-react';

/* ─── Data ─────────────────────────────────────────────────────── */
const features = [
  {
    icon: <GitBranch size={22} />,
    color: 'var(--brand-600)',
    bg: 'var(--brand-50)',
    title: 'Sprint Management',
    desc: 'Plan, track and close sprints with full burndown visibility. Keep every iteration on schedule.',
  },
  {
    icon: <CheckSquare size={22} />,
    color: '#7C3AED',
    bg: '#F5F3FF',
    title: 'Task Tracking',
    desc: 'Assign tasks, set priorities and watch progress in real time across every team and project.',
  },
  {
    icon: <Users size={22} />,
    color: '#0EA5E9',
    bg: '#E0F2FE',
    title: 'Team Coordination',
    desc: 'Organise employees into teams, manage roles and handle reassignments without friction.',
  },
  {
    icon: <Calendar size={22} />,
    color: '#10B981',
    bg: '#D1FAE5',
    title: 'Leave Management',
    desc: 'Submit and approve leave requests with automated workflow so nothing falls through the cracks.',
  },
  {
    icon: <BarChart3 size={22} />,
    color: '#F59E0B',
    bg: '#FEF3C7',
    title: 'Work Logs & Reports',
    desc: 'Log hours, generate reports and gain insight into how time is spent across the organisation.',
  },
  {
    icon: <Bell size={22} />,
    color: '#EF4444',
    bg: '#FEE2E2',
    title: 'Real-time Notifications',
    desc: 'Socket-powered alerts keep every stakeholder informed the moment something changes.',
  },
];

const stats = [
  { label: 'Sprint Velocity', value: '↑ 34%', sub: 'faster delivery' },
  { label: 'On-time Releases', value: '92%', sub: 'average across teams' },
  { label: 'Task Visibility', value: '100%', sub: 'real-time tracking' },
  { label: 'Stand-up Time', value: '↓ 60%', sub: 'with async standups' },
];

const roles = [
  { icon: <Shield size={18} />, label: 'Admin', desc: 'Full control — users, departments, projects and system config.' },
  { icon: <Target size={18} />, label: 'Scrum Master', desc: 'Facilitate sprints, run standups and unblock your teams daily.' },
  { icon: <Star size={18} />, label: 'Employee', desc: 'Focus on tasks, log work and stay in sync with zero overhead.' },
];

/* ─── Component ─────────────────────────────────────────────────── */
const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-primary, #0F172A)', background: '#F4F6FB', minHeight: '100vh' }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5%', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={20} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>
            Sprint<span style={{ color: '#2563EB' }}>Flow</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={ghostBtn}>Sign In</button>
          <button onClick={() => navigate('/register')} style={primaryBtn}>Get Started →</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(135deg,#EFF6FF 0%,#EEF2FF 50%,#F5F3FF 100%)',
        padding: '96px 5% 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative blobs */}
        <div style={blob('#2563EB', 480, -120, -60)} />
        <div style={blob('#7C3AED', 400, 'auto', -80, -100)} />

        <div style={{ position: 'relative', maxWidth: 780, margin: '0 auto' }}>
          <span style={pill}>🚀 Scrum & Workforce Management</span>

          <h1 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 'clamp(2.2rem,5vw,3.6rem)',
            fontWeight: 800, lineHeight: 1.12,
            letterSpacing: -1.5, margin: '20px 0 24px',
          }}>
            Ship faster with <span style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SprintFlow</span>
          </h1>

          <p style={{ fontSize: '1.125rem', color: '#475569', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 40px' }}>
            The all-in-one platform for agile teams — sprint planning, task tracking, standups, leave management and real-time notifications in one unified workspace.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ ...primaryBtn, padding: '14px 32px', fontSize: 16 }}>
              Start Free &nbsp;→
            </button>
            <button onClick={() => navigate('/login')} style={{ ...ghostBtn, padding: '14px 28px', fontSize: 16 }}>
              Sign In
            </button>
          </div>

          <p style={{ marginTop: 20, fontSize: 13, color: '#94A3B8' }}>No credit card required · Free to get started</p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: '#fff', padding: '48px 5%', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#2563EB' }}>{s.value}</div>
              <div style={{ fontWeight: 600, color: '#1E293B', marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 5%', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={pill}>Everything you need</span>
          <h2 style={sectionHead}>One platform, zero chaos</h2>
          <p style={sectionSub}>SprintFlow bundles every tool your engineering team needs — from sprint kick-off to retrospective.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
          {features.map(f => (
            <div key={f.title} style={featureCard}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 16 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: '#0F172A' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Role Cards ── */}
      <section style={{ background: 'linear-gradient(135deg,#EFF6FF,#EEF2FF)', padding: '80px 5%' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
          <span style={pill}>Built for every stakeholder</span>
          <h2 style={sectionHead}>One tool, three perspectives</h2>
          <p style={sectionSub}>Every role gets a tailored dashboard — only the data that matters, none of the noise.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20, marginTop: 40 }}>
            {roles.map(r => (
              <div key={r.label} style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', border: '1px solid #E2E8F0', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-50,#EFF6FF)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {r.icon}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>{r.label}</span>
                </div>
                <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '80px 5%', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <span style={pill}>Simple onboarding</span>
        <h2 style={sectionHead}>Up and running in minutes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24, marginTop: 48 }}>
          {[
            { n: '01', icon: <Users size={20} />, t: 'Register your team', d: 'Create an account, add departments and invite your team members.' },
            { n: '02', icon: <GitBranch size={20} />, t: 'Set up your project', d: 'Create a project, link a team and kick off your first sprint.' },
            { n: '03', icon: <CheckSquare size={20} />, t: 'Track & deliver', d: 'Assign tasks, run standups and ship with confidence every sprint.' },
            { n: '04', icon: <TrendingUp size={20} />, t: 'Measure & improve', d: 'Review burndown charts and work logs to refine your process.' },
          ].map(s => (
            <div key={s.n} style={{ position: 'relative', padding: '28px 20px', background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0' }}>
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>{s.n}</div>
              <div style={{ color: '#2563EB', marginBottom: 12, marginTop: 8 }}>{s.icon}</div>
              <h4 style={{ fontWeight: 700, marginBottom: 8 }}>{s.t}</h4>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        margin: '0 5% 80px', borderRadius: 24,
        background: 'linear-gradient(135deg,#2563EB 0%,#4F46E5 60%,#7C3AED 100%)',
        padding: '64px 40px', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={blob('#fff', 300, -60, -60, undefined, 0.08)} />
        <div style={blob('#fff', 260, 'auto', -40, -60, 0.06)} />
        <div style={{ position: 'relative' }}>
          <Clock size={36} style={{ marginBottom: 20, opacity: 0.9 }} />
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 800, marginBottom: 16 }}>
            Ready to run your best sprint yet?
          </h2>
          <p style={{ opacity: 0.85, fontSize: '1.05rem', marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
            Join teams that ship on time, every time, with SprintFlow as their command centre.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ background: '#fff', color: '#2563EB', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              Create free account <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 10, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0F172A', color: '#94A3B8', textAlign: 'center', padding: '28px 5%', fontSize: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color="#fff" />
          </div>
          <span style={{ color: '#F1F5F9', fontWeight: 700 }}>SprintFlow</span>
        </div>
        <p>© {new Date().getFullYear()} SprintFlow · Scrum & Workforce Management</p>
      </footer>
    </div>
  );
};

/* ─── Style helpers ─────────────────────────────────────────────── */
const primaryBtn: React.CSSProperties = {
  background: 'linear-gradient(135deg,#2563EB,#4F46E5)',
  color: '#fff', border: 'none', borderRadius: 10,
  padding: '10px 20px', fontSize: 14, fontWeight: 600,
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
};

const ghostBtn: React.CSSProperties = {
  background: 'transparent', color: '#334155',
  border: '1.5px solid #CBD5E1', borderRadius: 10,
  padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
};

const pill: React.CSSProperties = {
  display: 'inline-block', background: '#EEF2FF', color: '#4F46E5',
  borderRadius: 99, padding: '5px 14px', fontSize: 13, fontWeight: 600, marginBottom: 16,
};

const sectionHead: React.CSSProperties = {
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800,
  letterSpacing: -0.8, color: '#0F172A', marginBottom: 14,
};

const sectionSub: React.CSSProperties = {
  fontSize: '1rem', color: '#64748B', lineHeight: 1.7, maxWidth: 560, margin: '0 auto',
};

const featureCard: React.CSSProperties = {
  background: '#fff', borderRadius: 16, padding: '28px 24px',
  border: '1px solid #E2E8F0',
  transition: 'transform .2s, box-shadow .2s',
};

function blob(
  color: string, size: number,
  top: number | string, left: number | string,
  right?: number | string, opacity = 0.07
): React.CSSProperties {
  return {
    position: 'absolute',
    width: size, height: size,
    borderRadius: '50%',
    background: color,
    opacity,
    top: top as any,
    left: left as any,
    right: right as any,
    filter: 'blur(80px)',
    pointerEvents: 'none',
  };
}

export default HomePage;
