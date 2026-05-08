import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import './Home.css';

const MODULES = [
  {
    path: '/gd',
    icon: '💬',
    title: 'GROUP DISCUSSION',
    code: 'GD',
    desc: 'Practice structured group discussion topics with 500-word insights and strategic frameworks.',
    color: 'green',
    tag: 'REASONING'
  },
  {
    path: '/ppdt',
    icon: '🖼️',
    title: 'PP&DT',
    code: 'PPDT',
    desc: 'Picture Perception & Description Test — narrate stories from ambiguous images under pressure.',
    color: 'gold',
    tag: 'PERCEPTION'
  },
  {
    path: '/gto',
    icon: '🪖',
    title: 'GTO TASKS',
    code: 'GTO',
    desc: 'Group Task Obstacles — study structures, progressive group tasks, and command tasks.',
    color: 'blue',
    tag: 'LEADERSHIP'
  },
  {
    path: '/wat',
    icon: '✍️',
    title: 'WORD ASSOCIATION',
    code: 'WAT',
    desc: '60 words, 15 seconds each. Train your instinctive response patterns for the WAT.',
    color: 'green',
    tag: 'PSYCHOLOGY'
  },
  {
    path: '/srt',
    icon: '⚡',
    title: 'SITUATION REACTION',
    code: 'SRT',
    desc: '60 real-world situations in 30 minutes. Sharpen your decision-making under time pressure.',
    color: 'red',
    tag: 'JUDGMENT'
  },
  {
    path: '/lecturette',
    icon: '🎤',
    title: 'LECTURETTE',
    code: 'LECT',
    desc: 'Speak confidently on random topics. Practice structured 3-minute presentations.',
    color: 'gold',
    tag: 'COMMUNICATION',
    settingKey: 'lecturetteVisible'
  },
  {
    path: '/meet',
    icon: '📅',
    title: 'LIVE SESSIONS',
    code: 'MEET',
    desc: 'Join scheduled Google Meet training sessions with expert guidance and peer practice.',
    color: 'blue',
    tag: 'LIVE',
    settingKey: 'meetVisible'
  },
  {
    path: '/youtube',
    icon: '📺',
    title: 'VIDEO LIBRARY',
    code: 'VIDS',
    desc: 'Curated YouTube training sessions from SSB toppers and defence experts.',
    color: 'red',
    tag: 'MULTIMEDIA',
    settingKey: 'youtubeVisible'
  }
];

const STATS = [
  { label: 'MODULES', value: '8' },
  { label: 'WAT WORDS', value: '60+' },
  { label: 'SRT SETS', value: '60' },
  { label: 'SESSIONS', value: 'LIVE' },
];

export default function Home() {
  const { settings } = useSettings();

  const visibleModules = MODULES.filter(m => {
    if (m.settingKey && !settings[m.settingKey]) return false;
    return true;
  });

  return (
    <div className="home tac-grid">
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-badge font-mono">
            <span className="badge-dot" /> OPERATIONAL — SSB PREP PLATFORM
          </div>
          <h1 className="hero-title">
            <span className="line1">DEFENCE</span>
            <span className="line2">PATHWAY</span>
          </h1>
          <p className="hero-sub">
            Elite preparation system for Indian Armed Forces aspirants.
            Master every SSB phase — GD, WAT, SRT, PPDT, GTO, and Lecturette.
          </p>
          <div className="hero-actions">
            <Link to="/wat" className="btn btn-primary">START TRAINING</Link>
            <Link to="/srt" className="btn btn-ghost">TAKE SRT TEST</Link>
          </div>
          <div className="hero-stats">
            {STATS.map(s => (
              <div key={s.label} className="stat-item">
                <span className="stat-value font-mono">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-bg-text" aria-hidden>HONOUR COURAGE COMMITMENT</div>
      </section>

      {/* Modules grid */}
      <section className="modules-section">
        <div className="container">
          <div className="section-header">
            <div className="section-icon">📋</div>
            <div>
              <h2>TRAINING MODULES</h2>
              <p className="text-secondary">Select your preparation area</p>
            </div>
          </div>
          <div className="modules-grid">
            {visibleModules.map((mod, i) => (
              <Link
                to={mod.path}
                key={mod.path}
                className={`module-card color-${mod.color} animate-fade corner-accent`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="module-top">
                  <span className="module-icon">{mod.icon}</span>
                  <span className={`badge badge-${mod.color === 'green' ? 'green' : mod.color === 'gold' ? 'gold' : mod.color === 'red' ? 'red' : 'blue'}`}>
                    {mod.tag}
                  </span>
                </div>
                <div className="module-code font-mono">{mod.code}</div>
                <h3 className="module-title">{mod.title}</h3>
                <p className="module-desc">{mod.desc}</p>
                <div className="module-cta">
                  ENTER MODULE <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mission brief */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-card corner-accent">
            <div className="mission-label font-mono">MISSION BRIEF</div>
            <h2>PREPARE. PERFORM. PREVAIL.</h2>
            <p>
              Defence Pathway provides the most comprehensive SSB preparation experience.
              Each module mirrors real SSB testing conditions with accurate timers,
              structured content, and progressive difficulty.
            </p>
            <div className="mission-points">
              {[
                '🎯 Timed exam simulation matching real SSB conditions',
                '🧠 Psychology-based WAT/SRT training for personality assessment',
                '👥 Group task preparation with GTO obstacle training',
                '📡 Live sessions with expert SSB mentors',
              ].map(p => <div key={p} className="mission-point">{p}</div>)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
