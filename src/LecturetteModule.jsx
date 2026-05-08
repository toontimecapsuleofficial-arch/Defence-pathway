import { useState, useEffect, useRef } from 'react';
import { getLecturetteTopics } from '../firebase/firestore';
import { useSettings } from '../hooks/useSettings';

const DEMO_TOPICS = [
  { title: 'Climate Change and National Security', category: 'Defence' },
  { title: 'Role of Technology in Modern Warfare', category: 'Technology' },
  { title: 'India\'s Space Ambitions', category: 'Science' },
  { title: 'Importance of Mental Health in Armed Forces', category: 'Wellness' },
  { title: 'Women in Leadership Roles', category: 'Society' },
  { title: 'India-China Border Tensions', category: 'Geopolitics' },
  { title: 'Cyber Security as a National Priority', category: 'Technology' },
  { title: 'The Agnipath Scheme — Pros and Cons', category: 'Policy' },
  { title: 'Renewable Energy and India\'s Future', category: 'Environment' },
  { title: 'Leadership Lessons from Military History', category: 'Defence' },
  { title: 'Role of Youth in Nation Building', category: 'Society' },
  { title: 'Terrorism — A Global Challenge', category: 'Security' },
];

export default function LecturetteModule() {
  const { settings } = useSettings();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('select'); // select | prep | speak | done
  const [timeLeft, setTimeLeft] = useState(0);
  const [prepTime] = useState(60); // 1 min prep
  const [speakTime] = useState((settings.lecturetteTimer || 3) * 60);
  const timerRef = useRef(null);

  useEffect(() => {
    getLecturetteTopics()
      .then(d => setTopics(d.length > 0 ? d : DEMO_TOPICS))
      .catch(() => setTopics(DEMO_TOPICS))
      .finally(() => setLoading(false));
  }, []);

  const startTopic = (topic) => {
    setSelected(topic);
    setPhase('prep');
    setTimeLeft(prepTime);
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); startSpeaking(); return 0; }
        return prev - 1;
      });
    }, 1000);
    timerRef.current = t;
  };

  const startSpeaking = () => {
    setPhase('speak');
    setTimeLeft(speakTime);
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); setPhase('done'); return 0; }
        return prev - 1;
      });
    }, 1000);
    timerRef.current = t;
  };

  const exitSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('select');
    setSelected(null);
  };

  const randomTopic = () => startTopic(topics[Math.floor(Math.random() * topics.length)]);

  const mm = Math.floor(timeLeft / 60);
  const ss = timeLeft % 60;
  const timerStr = `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  const timerClass = timeLeft < 30 ? 'danger' : timeLeft < 60 ? 'warning' : '';

  if (loading) return <div className="loading-center"><div className="spinner" /><span>LOADING TOPICS...</span></div>;

  if (phase !== 'select') {
    return (
      <div className="focus-mode">
        <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
          <div className="font-mono text-muted mb-3" style={{ letterSpacing: '0.3em', fontSize: '0.75rem' }}>
            {phase === 'prep' ? 'PREPARATION TIME' : phase === 'speak' ? 'SPEAKING TIME' : 'SESSION COMPLETE'}
          </div>

          <div className="card corner-accent mb-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', padding: '2rem' }}>
            <div className="font-mono text-green mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.2em' }}>
              {selected?.category?.toUpperCase() || 'LECTURETTE'}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
              {selected?.title}
            </h2>
          </div>

          {phase !== 'done' && (
            <div className={`timer-display mb-2 ${timerClass}`} style={{ fontSize: '4rem' }}>
              {timerStr}
            </div>
          )}

          <div className="mb-3">
            {phase === 'prep' && (
              <p className="text-secondary">Organize your thoughts. Structure: Introduction → 3 Key Points → Conclusion</p>
            )}
            {phase === 'speak' && (
              <p className="text-secondary" style={{ color: 'var(--accent-bright)' }}>🎤 SPEAK NOW — Confident, structured, clear</p>
            )}
            {phase === 'done' && (
              <div>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <p className="text-secondary">Lecturette session completed!</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-center">
            {phase === 'prep' && <button onClick={startSpeaking} className="btn btn-primary">SKIP PREP → START SPEAKING</button>}
            {phase === 'speak' && <button onClick={() => { clearInterval(timerRef.current); setPhase('done'); }} className="btn btn-ghost">END EARLY</button>}
            {phase === 'done' && (
              <>
                <button onClick={() => startTopic(selected)} className="btn btn-primary">RETRY</button>
                <button onClick={randomTopic} className="btn btn-gold">RANDOM TOPIC</button>
              </>
            )}
            <button onClick={exitSession} className="btn btn-ghost">EXIT</button>
          </div>
        </div>
      </div>
    );
  }

  const categories = [...new Set(topics.map(t => t.category).filter(Boolean))];

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <div className="section-icon">🎤</div>
          <div>
            <h1>LECTURETTE MODULE</h1>
            <p className="text-secondary">Random topic selection • Timed practice • Structured delivery</p>
          </div>
        </div>

        <div className="card mb-3" style={{ maxWidth: '700px' }}>
          <h3 className="text-gold mb-2">SESSION FORMAT</h3>
          <div className="grid-2">
            <div className="stat-box"><span className="font-mono text-green" style={{fontSize:'1.5rem'}}>1 MIN</span><span className="text-muted">PREPARATION</span></div>
            <div className="stat-box"><span className="font-mono text-gold" style={{fontSize:'1.5rem'}}>{settings.lecturetteTimer || 3} MIN</span><span className="text-muted">SPEAKING TIME</span></div>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <button onClick={randomTopic} className="btn btn-primary">🎲 RANDOM TOPIC</button>
        </div>

        {categories.map(cat => (
          <div key={cat} className="mb-3">
            <h3 className="mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
              {cat.toUpperCase()}
            </h3>
            <div className="grid-3">
              {topics.filter(t => t.category === cat).map((topic, i) => (
                <div
                  key={topic.id || i}
                  className="card animate-fade"
                  style={{ cursor: 'pointer', animationDelay: `${i * 0.03}s`, opacity: 0 }}
                  onClick={() => startTopic(topic)}
                >
                  <span className="badge badge-gold mb-2" style={{ fontSize: '0.65rem' }}>{topic.category}</span>
                  <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', letterSpacing: '0.03em', marginBottom: '0.5rem' }}>
                    {topic.title}
                  </h3>
                  <div className="gd-card-cta font-mono" style={{ fontSize: '0.7rem' }}>START PRACTICE →</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
