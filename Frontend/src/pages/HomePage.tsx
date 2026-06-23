import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Sparkles, GitBranch, CheckSquare, Users, Calendar,
  BarChart3, Bell, UserCheck, Shield, Target, Star, Rocket,
  TrendingUp, Clock, ArrowRight, Play, Lock,
} from 'lucide-react';

const words = ['with SprintFlow', 'with agility', 'every sprint'];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollPct, setScrollPct] = useState(0);
  const [typeText, setTypeText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsCounted, setStatsCounted] = useState(false);
  const [sc1, setSc1] = useState(0);
  const [sc2, setSc2] = useState(0);
  const [sc3, setSc3] = useState(0);
  const [sc4, setSc4] = useState(0);
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      setScrollPct(Math.round(p * 100));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Typewriter
  useEffect(() => {
    let wi = 0, ci = 0, del = false;
    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      const w = words[wi];
      if (!del) {
        ci++;
        setTypeText(w.slice(0, ci));
        if (ci === w.length) {
          del = true;
          setTypingDone(true);
          setTimeout(tick, 1600);
          return;
        }
      } else {
        ci--;
        setTypeText(w.slice(0, ci));
        if (ci === 0) {
          del = false;
          wi = (wi + 1) % words.length;
          setTypingDone(false);
        }
      }
      setTimeout(tick, del ? 45 : 80);
    };
    const id = setTimeout(tick, 900);
    return () => { mounted = false; clearTimeout(id); };
  }, []);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealRefs.current.forEach((el) => { if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  // Stats counting
  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsCounted) {
          setStatsCounted(true);
          const count = (id: string, target: number, suf: number) => {
            let c = 0;
            const step = Math.max(1, Math.ceil(target / 55));
            const t = setInterval(() => {
              c = Math.min(c + step, target);
              if (id === 'sc1') setSc1(c);
              else if (id === 'sc2') setSc2(c);
              else if (id === 'sc3') setSc3(c);
              else if (id === 'sc4') setSc4(c);
              if (c >= target) clearInterval(t);
            }, 28);
          };
          count('sc1', 34, 0); count('sc2', 92, 0); count('sc3', 100, 0); count('sc4', 60, 0);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, [statsCounted]);

  const setRef = (i: number) => (el: HTMLDivElement | null) => { revealRefs.current[i] = el; };

  return (
    <div className="lp" style={{ fontFamily: 'Inter, sans-serif', background: '#f8fbff', color: '#0f172a', overflowX: 'hidden', minHeight: '100vh' }}>
      {/* Progress bar */}
      <div style={{ position: 'sticky', top: 0, left: 0, height: 3, background: 'linear-gradient(90deg,#2563EB,#6366f1,#38bdf8)', width: scrollPct + '%', zIndex: 999, transition: 'width .08s linear', borderRadius: '0 2px 2px 0' }} />

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 3, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5%', height: 66, background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #dbeafe' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#2563EB,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-.5px', background: 'linear-gradient(135deg,#2563EB,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SprintFlow</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="bg" onClick={() => navigate('/login')} style={{ background: 'transparent', color: '#334155', border: '1.5px solid #cbd5e1', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Sign In</button>
          <button className="bp" onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg,#2563EB,#6366f1)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,99,235,.3)', fontFamily: 'Inter, sans-serif' }}>Get Started →</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', padding: '100px 5% 80px', textAlign: 'center', overflow: 'hidden', minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg,#eff6ff 0%,#f8fbff 40%,#eef2ff 100%)' }}>
        {/* Grid bg */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(37,99,235,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.05) 1px,transparent 1px)', backgroundSize: '56px 56px', pointerEvents: 'none' }} />

        {/* Orbs */}
        <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', pointerEvents: 'none', filter: 'blur(80px)', background: 'radial-gradient(circle,rgba(37,99,235,.18),transparent 70%)', top: -160, left: -120 }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', pointerEvents: 'none', filter: 'blur(80px)', background: 'radial-gradient(circle,rgba(99,102,241,.14),transparent 70%)', top: 80, right: -100 }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', pointerEvents: 'none', filter: 'blur(80px)', background: 'radial-gradient(circle,rgba(56,189,248,.12),transparent 70%)', bottom: -60, left: '35%' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 99, padding: '6px 16px', fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 28, letterSpacing: '.3px' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563EB' }} />
          Trusted by 1,240+ engineering teams worldwide
        </div>

        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 'clamp(2.4rem,5.5vw,4rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: -2, maxWidth: 800, margin: '0 auto 10px', color: '#0f172a' }}>
          Ship faster.<br />
          <span style={{ background: 'linear-gradient(135deg,#2563EB 0%,#6366f1 50%,#38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sprint smarter</span><br />
          <span>{typeText}</span><span style={{ display: 'inline-block', width: 3, height: '.85em', background: '#2563EB', verticalAlign: 'middle', marginLeft: 3, animation: 'blink .7s step-end infinite' }} />
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.75, maxWidth: 560, margin: '20px auto 44px' }}>
          The all-in-one platform for agile teams — sprint planning, task tracking, standups, leave management and real-time notifications in one unified workspace.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg,#2563EB,#6366f1)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 34px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,99,235,.3)', fontFamily: 'Inter, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Start for free &nbsp;→
          </button>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', color: '#334155', border: '1.5px solid #cbd5e1', borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Watch demo &nbsp;<Play size={13} />
          </button>
        </div>

        <p style={{ marginTop: 18, fontSize: 12, color: '#94a3b8', letterSpacing: '.2px' }}>No credit card · Free to get started · Setup in 2 minutes</p>

        {/* Chips */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 52 }}>
          {[
            { bg: '#eff6ff', c: '#2563EB', icon: <TrendingUp size={16} />, label: 'Sprint velocity', val: '+34%' },
            { bg: '#f0f9ff', c: '#0284c7', icon: <Clock size={16} />, label: 'On-time releases', val: '92%' },
            { bg: '#eef2ff', c: '#6366f1', icon: <Users size={16} />, label: 'Stand-up time', val: '↓60%' },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #dbeafe', borderRadius: 12, padding: '10px 16px', fontSize: 13, color: '#334155', boxShadow: '0 2px 12px rgba(37,99,235,.07)' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, background: c.bg, color: c.c }}>{c.icon}</div>
              {c.label} <span style={{ fontWeight: 700, color: '#1d4ed8', fontSize: 15 }}>{c.val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Proof bar */}
      <div ref={setRef(0)} style={{ background: '#fff', borderTop: '1.5px solid #dbeafe', borderBottom: '1.5px solid #dbeafe', padding: '18px 5%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, flexWrap: 'wrap', opacity: 0, transform: 'translateY(32px)', transition: 'opacity .65s ease,transform .65s ease' }}>
        {[
          { val: '1,240+', label: 'teams active' },
          { val: '98%', label: 'satisfaction' },
          { val: '4.9★', label: 'rating' },
          { val: '2M+', label: 'tasks tracked' },
          { val: 'SOC 2', label: 'certified' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#64748b', fontWeight: 500 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1d4ed8' }}>{s.val}</span> {s.label}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ padding: '64px 5% 0', maxWidth: 1000, margin: '0 auto' }} ref={statsRef}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 2 }}>
          {[
            { val: sc1 + (sc1 === 34 ? '%↑' : ''), label: 'Sprint Velocity', sub: 'faster delivery', d: 1 },
            { val: sc2 + (sc2 === 92 ? '%' : ''), label: 'On-time Releases', sub: 'avg across teams', d: 2 },
            { val: sc3 + (sc3 === 100 ? '%' : ''), label: 'Task Visibility', sub: 'real-time tracking', d: 3 },
            { val: sc4 + (sc4 === 60 ? '%↓' : ''), label: 'Stand-up Time', sub: 'with async standups', d: 4 },
          ].map((s, i) => (
            <div key={i} ref={setRef(i + 1)} style={{ background: '#fff', border: '1.5px solid #dbeafe', padding: '36px 28px', textAlign: 'center', borderRadius: i === 0 ? '16px 0 0 16px' : i === 3 ? '0 16px 16px 0' : 0, opacity: 0, transform: 'translateY(32px)', transition: 'opacity .65s ease,transform .65s ease', transitionDelay: (0.08 * i) + 's' }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '2.6rem', fontWeight: 900, background: 'linear-gradient(135deg,#2563EB,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginTop: 8 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: '1.5px', background: 'linear-gradient(90deg,transparent,#bfdbfe,transparent)', margin: '60px 5% 0' }} />

      {/* Features */}
      <section style={{ padding: '80px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div ref={setRef(5)} style={{ textAlign: 'center', marginBottom: 52, opacity: 0, transform: 'translateY(32px)', transition: 'opacity .65s ease,transform .65s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1.5px solid #bfdbfe', color: '#1d4ed8', borderRadius: 99, padding: '5px 14px', fontSize: 12, fontWeight: 700, marginBottom: 18, letterSpacing: '.5px', textTransform: 'uppercase' }}>
              <Sparkles size={12} /> Features
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 'clamp(1.7rem,3.2vw,2.5rem)', fontWeight: 800, letterSpacing: -1, marginBottom: 14, lineHeight: 1.15, color: '#0f172a' }}>
              One platform, <span style={{ background: 'linear-gradient(135deg,#2563EB,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>zero chaos</span>
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.75, maxWidth: 540, margin: '0 auto' }}>Everything your engineering team needs — from sprint kick-off to retrospective.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { span: 2, bg: '#eff6ff', c: '#2563EB', icon: <GitBranch size={22} />, title: 'Sprint Management', desc: 'Plan, track and close sprints with full burndown visibility. Keep every iteration on schedule with smart alerts and velocity forecasting built in.', badge: 'Core feature', d: 1 },
              { bg: '#eef2ff', c: '#6366f1', icon: <CheckSquare size={22} />, title: 'Task Tracking', desc: 'Assign tasks, set priorities and watch progress in real time across every team and project.', d: 2 },
              { bg: '#f0f9ff', c: '#0284c7', icon: <Users size={22} />, title: 'Team Coordination', desc: 'Organise employees into teams, manage roles and handle reassignments without friction.', d: 3 },
              { bg: '#f0fdf4', c: '#16a34a', icon: <Calendar size={22} />, title: 'Leave Management', desc: 'Submit and approve leave requests with automated workflow so nothing falls through the cracks.', d: 4 },
              { bg: '#fffbeb', c: '#d97706', icon: <BarChart3 size={22} />, title: 'Work Logs & Reports', desc: 'Log hours, generate reports and gain insight into how time is spent across the organisation.', d: 5 },
              { bg: '#fef2f2', c: '#dc2626', icon: <Bell size={22} />, title: 'Real-time Alerts', desc: 'Socket-powered notifications keep every stakeholder informed the moment something changes.', d: 6 },
            ].map((f, i) => (
              <div key={i} ref={setRef(6 + i)} style={{
                background: '#fff', border: '1.5px solid #dbeafe', borderRadius: 20, padding: '32px 28px',
                cursor: 'default', position: 'relative', overflow: 'hidden',
                gridColumn: f.span ? 'span 2' : undefined,
                opacity: 0, transform: 'translateY(32px)',
                transition: 'opacity .65s ease,transform .65s ease',
                transitionDelay: (0.08 * (f.d - 1)) + 's',
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 20, background: f.bg, color: f.c }}>{f.icon}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10, color: '#0f172a', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{f.title}</div>
                <div style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.65 }}>{f.desc}</div>
                {f.badge && <span style={{ display: 'inline-block', marginTop: 14, background: '#eff6ff', border: '1.5px solid #bfdbfe', color: '#1d4ed8', borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '.3px' }}>{f.badge}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: '1.5px', background: 'linear-gradient(90deg,transparent,#bfdbfe,transparent)', margin: '0 5%' }} />

      {/* Roles */}
      <section style={{ padding: '80px 5%', background: '#f8fbff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div ref={setRef(12)} style={{ textAlign: 'center', opacity: 0, transform: 'translateY(32px)', transition: 'opacity .65s ease,transform .65s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1.5px solid #bfdbfe', color: '#1d4ed8', borderRadius: 99, padding: '5px 14px', fontSize: 12, fontWeight: 700, marginBottom: 18, letterSpacing: '.5px', textTransform: 'uppercase' }}>
              <UserCheck size={12} /> Roles
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 'clamp(1.7rem,3.2vw,2.5rem)', fontWeight: 800, letterSpacing: -1, marginBottom: 14, lineHeight: 1.15, color: '#0f172a' }}>
              Built for <span style={{ background: 'linear-gradient(135deg,#2563EB,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>every stakeholder</span>
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.75, maxWidth: 540, margin: '0 auto 48px' }}>Every role gets a tailored dashboard — only the data that matters, none of the noise.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
            {[
              { icon: <Shield size={20} />, bg: '#eff6ff', bc: '#bfdbfe', c: '#2563EB', title: 'Admin', desc: 'Full control — users, departments, projects and system config in one place.', tag: 'Full access', tc: '#1d4ed8', tb: '#eff6ff', tbc: '#bfdbfe', d: 1 },
              { icon: <Target size={20} />, bg: '#eef2ff', bc: '#c7d2fe', c: '#6366f1', title: 'Scrum Master', desc: 'Facilitate sprints, run standups and unblock your teams every single day.', tag: 'Sprint control', tc: '#4f46e5', tb: '#eef2ff', tbc: '#c7d2fe', d: 2 },
              { icon: <Star size={20} />, bg: '#f0fdf4', bc: '#bbf7d0', c: '#16a34a', title: 'Employee', desc: 'Focus on tasks, log work and stay in sync with zero overhead or noise.', tag: 'Focused view', tc: '#16a34a', tb: '#f0fdf4', tbc: '#bbf7d0', d: 3 },
            ].map((r, i) => (
              <div key={i} ref={setRef(13 + i)} style={{
                background: '#fff', border: '1.5px solid #dbeafe', borderRadius: 20, padding: '32px 26px',
                position: 'relative', overflow: 'hidden',
                opacity: 0, transform: 'translateY(32px)',
                transition: 'opacity .65s ease,transform .65s ease',
                transitionDelay: (0.08 * (r.d - 1)) + 's',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: r.bg, border: '1.5px solid ' + r.bc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 18, color: r.c }}>{r.icon}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{r.title}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>{r.desc}</div>
                <span style={{ display: 'inline-block', marginTop: 14, borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '.3px', background: r.tb, border: '1.5px solid ' + r.tbc, color: r.tc }}>{r.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: '1.5px', background: 'linear-gradient(90deg,transparent,#bfdbfe,transparent)', margin: '0 5%' }} />

      {/* How it works */}
      <section style={{ padding: '80px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div ref={setRef(16)} style={{ textAlign: 'center', opacity: 0, transform: 'translateY(32px)', transition: 'opacity .65s ease,transform .65s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1.5px solid #bfdbfe', color: '#1d4ed8', borderRadius: 99, padding: '5px 14px', fontSize: 12, fontWeight: 700, marginBottom: 18, letterSpacing: '.5px', textTransform: 'uppercase' }}>
              <Rocket size={12} /> Onboarding
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 'clamp(1.7rem,3.2vw,2.5rem)', fontWeight: 800, letterSpacing: -1, marginBottom: 14, lineHeight: 1.15, color: '#0f172a' }}>
              Up and running <span style={{ background: 'linear-gradient(135deg,#2563EB,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>in minutes</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(195px,1fr))', gap: 20, marginTop: 52 }}>
            {[
              { n: '01', icon: <Users size={26} />, title: 'Register your team', desc: 'Create an account, add departments and invite your team members.', d: 1 },
              { n: '02', icon: <GitBranch size={26} />, title: 'Set up your project', desc: 'Create a project, link a team and kick off your first sprint.', d: 2 },
              { n: '03', icon: <CheckSquare size={26} />, title: 'Track & deliver', desc: 'Assign tasks, run standups and ship with confidence every sprint.', d: 3 },
              { n: '04', icon: <TrendingUp size={26} />, title: 'Measure & improve', desc: 'Review burndown charts and work logs to refine your process.', d: 4 },
            ].map((s, i) => (
              <div key={i} ref={setRef(17 + i)} style={{
                background: '#fff', border: '1.5px solid #dbeafe', borderRadius: 20, padding: '32px 22px 26px', textAlign: 'center',
                opacity: 0, transform: 'translateY(32px)',
                transition: 'opacity .65s ease,transform .65s ease',
                transitionDelay: (0.08 * (s.d - 1)) + 's',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,#2563EB,#6366f1)', color: '#fff', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 4px 16px rgba(37,99,235,.3)' }}>{s.n}</div>
                <div style={{ color: '#2563EB', marginBottom: 14, fontSize: 26 }}>{s.icon}</div>
                <div style={{ fontSize: '.95rem', fontWeight: 700, color: '#0f172a', marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div ref={setRef(21)} style={{
        margin: '0 5% 80px', borderRadius: 28,
        background: 'linear-gradient(135deg,#1e3a8a 0%,#3730a3 50%,#1e3a8a 100%)',
        border: '1px solid rgba(147,197,253,.2)',
        padding: '80px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden',
        opacity: 0, transform: 'translateY(32px)',
        transition: 'opacity .65s ease,transform .65s ease',
      }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,.35),transparent 70%)', top: -120, left: -80, pointerEvents: 'none', filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(56,189,248,.25),transparent 70%)', bottom: -80, right: -60, pointerEvents: 'none', filter: 'blur(70px)' }} />
        <div style={{ position: 'relative' }}>
          <span style={{ fontSize: 42, display: 'block', marginBottom: 22 }}>⚡</span>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 'clamp(1.8rem,3.8vw,2.8rem)', fontWeight: 900, letterSpacing: -1, marginBottom: 16, lineHeight: 1.15, color: '#fff' }}>
            Ready to run your<br /><span style={{ background: 'linear-gradient(135deg,#93c5fd,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>best sprint yet?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Join teams that ship on time, every time, with SprintFlow as their command centre.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ background: '#fff', color: '#1d4ed8', border: 'none', borderRadius: 12, padding: '15px 34px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,.15)', fontFamily: 'Inter,sans-serif', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Create free account <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,.25)', borderRadius: 12, padding: '15px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              Sign In
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
            {[
              { icon: <Lock size={14} />, label: 'SOC 2 Certified' },
              { icon: <Shield size={14} />, label: 'GDPR Compliant' },
              { icon: <span style={{ fontSize: 14 }}>💳</span>, label: 'No card required' },
              { icon: <Clock size={14} />, label: '2-min setup' },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 500 }}>
                {t.icon} {t.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#0f172a', borderTop: '1px solid #1e293b', padding: '32px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#2563EB,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '.95rem', fontWeight: 800, letterSpacing: '-.5px', background: 'linear-gradient(135deg,#2563EB,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SprintFlow</span>
          <span style={{ fontSize: 13, color: '#475569', marginLeft: 8 }}>· © 2025</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Support', 'Status'].map((l) => (
            <a key={l} href="#" style={{ fontSize: 13, color: '#475569', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>

      {/* Keyframe styles */}
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .lp .in { opacity: 1 !important; transform: none !important; }
      `}</style>
    </div>
  );
};

export default HomePage;
