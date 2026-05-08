import { useState, useEffect } from 'react';
import { getGDTopics } from '../firebase/firestore';
import './GDModule.css';

const DEMO_TOPICS = [
  {
    title: 'Women in Combat Roles',
    content: `The integration of women into combat roles in the armed forces is a topic of significant debate. Proponents argue that capability and competence, not gender, should determine eligibility for combat duty. Modern warfare relies increasingly on technology and intelligence over physical strength, narrowing traditional capability gaps. Countries like Israel, Norway, and the United States have successfully integrated women into frontline roles. However, opponents raise concerns about unit cohesion, physical standards, and logistical challenges in field conditions. The discussion ultimately centers on whether the military's primary goal of combat effectiveness is best served by strict gender-based exclusions or by merit-based selection regardless of gender. Progressive militaries worldwide are navigating this balance with evolving policies, training standards, and integration frameworks.`,
    tags: ['Defence', 'Society', 'Policy']
  },
  {
    title: 'Artificial Intelligence in Modern Warfare',
    content: `Artificial Intelligence is rapidly transforming military operations, creating both unprecedented capabilities and serious ethical dilemmas. AI enables faster data processing, autonomous systems, precision targeting, and strategic simulation. Nations are investing heavily in military AI — drones that identify targets, logistics algorithms, and cyber defense systems powered by machine learning. However, the use of lethal autonomous weapons systems raises profound questions about accountability, the laws of armed conflict, and the risk of algorithmic errors causing civilian casualties. There is growing international pressure to establish treaties governing AI weapons, similar to conventions on chemical weapons. The debate weighs military advantage against the ethical imperative to maintain human control over life-and-death decisions in warfare.`,
    tags: ['Technology', 'Ethics', 'Defence']
  },
  {
    title: 'Mandatory Military Service for Youth',
    content: `Compulsory military service for young people has been a longstanding practice in many countries, including South Korea, Israel, and several European nations. Advocates argue it instills discipline, national pride, physical fitness, and a sense of civic duty in youth. It also ensures a large trained reserve force, enhancing national security. Critics, however, contend that mandatory service infringes on individual freedom, diverts young people from education and career development, and may not produce effective soldiers compared to smaller, highly trained professional forces. For a democracy like India, the question also touches on fundamental rights. The Agnipath scheme represents a middle-ground approach, generating debate about short-service military contracts and their long-term implications for both the armed forces and youth employment.`,
    tags: ['Policy', 'Youth', 'National Security']
  }
];

export default function GDModule() {
  const [topics, setTopics] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    getGDTopics()
      .then(d => { setTopics(d.length > 0 ? d : DEMO_TOPICS); })
      .catch(() => setTopics(DEMO_TOPICS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = topics.filter(t =>
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const startTimer = (mins) => {
    if (timer) clearInterval(timer);
    const secs = mins * 60;
    setTimeLeft(secs);
    setTimerRunning(true);
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); setTimerRunning(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    setTimer(t);
  };

  const randomTopic = () => {
    const t = topics[Math.floor(Math.random() * topics.length)];
    setSelected(t);
  };

  if (loading) return <div className="loading-center"><div className="spinner" /><span>LOADING TOPICS...</span></div>;

  if (selected) {
    const mm = Math.floor(timeLeft / 60);
    const ss = timeLeft % 60;
    return (
      <div className="page">
        <div className="container">
          <div className="gd-topic-view">
            <div className="gd-topic-header">
              <button onClick={() => { setSelected(null); if(timer) clearInterval(timer); setTimerRunning(false); }} className="btn btn-ghost btn-sm">← BACK</button>
              <div className="flex items-center gap-2">
                {timerRunning && (
                  <span className={`timer-display ${timeLeft < 60 ? 'danger' : timeLeft < 180 ? 'warning' : ''}`} style={{fontSize:'1.5rem'}}>
                    {String(mm).padStart(2,'0')}:{String(ss).padStart(2,'0')}
                  </span>
                )}
                <button onClick={() => startTimer(5)} className="btn btn-ghost btn-sm">5 MIN</button>
                <button onClick={() => startTimer(10)} className="btn btn-ghost btn-sm">10 MIN</button>
                <button onClick={() => startTimer(20)} className="btn btn-ghost btn-sm">20 MIN</button>
              </div>
            </div>
            <div className="gd-topic-card corner-accent">
              <div className="gd-topic-meta">
                <span className="font-mono text-muted" style={{fontSize:'0.75rem',letterSpacing:'0.2em'}}>GD TOPIC</span>
                <div className="flex gap-1">
                  {(selected.tags || []).map(tag => (
                    <span key={tag} className="badge badge-green">{tag}</span>
                  ))}
                </div>
              </div>
              <h1 className="gd-title">{selected.title}</h1>
              <div className="divider" />
              <div className="gd-content">
                {(selected.content || '').split('\n').map((p, i) => p.trim() && (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {selected.keyPoints && (
                <div className="gd-key-points">
                  <h3 className="text-gold mb-2">KEY POINTS</h3>
                  {selected.keyPoints.map((pt, i) => (
                    <div key={i} className="gd-point">
                      <span className="font-mono text-green">{'>'}</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <div className="section-icon">💬</div>
          <div>
            <h1>GROUP DISCUSSION</h1>
            <p className="text-secondary">Study topics • Practice frameworks • Timed discussions</p>
          </div>
        </div>

        <div className="gd-controls mb-3">
          <input
            type="text"
            placeholder="Search topics by name or tag..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
          <button onClick={randomTopic} className="btn btn-gold">🎲 RANDOM TOPIC</button>
        </div>

        <div className="grid-2">
          {filtered.map((topic, i) => (
            <div
              key={topic.id || i}
              className="gd-card card animate-fade corner-accent"
              style={{ animationDelay: `${i * 0.04}s`, cursor: 'pointer' }}
              onClick={() => setSelected(topic)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1">
                  {(topic.tags || []).map(tag => (
                    <span key={tag} className="badge badge-green" style={{ fontSize: '0.65rem' }}>{tag}</span>
                  ))}
                </div>
                <span className="font-mono text-muted" style={{ fontSize: '0.7rem' }}>GD</span>
              </div>
              <h3 className="gd-card-title">{topic.title}</h3>
              <p className="gd-card-excerpt">
                {(topic.content || '').slice(0, 120)}...
              </p>
              <div className="gd-card-cta font-mono">READ TOPIC →</div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-muted" style={{ padding: '3rem' }}>
            No topics found for "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}
