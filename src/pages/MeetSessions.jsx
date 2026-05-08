import { useState, useEffect } from 'react';
import { getMeetSessions } from '../firebase/firestore';

const DEMO_SESSIONS = [
  { title: 'SSB GTO Deep Dive', link: '#', time: new Date(Date.now() + 86400000).toISOString(), description: 'Complete walkthrough of GTO tasks with live Q&A' },
  { title: 'WAT & SRT Mastery', link: '#', time: new Date(Date.now() + 3 * 86400000).toISOString(), description: 'Psychology tests and response framework workshop' },
  { title: 'Lecturette Mock Sessions', link: '#', time: new Date(Date.now() + 7 * 86400000).toISOString(), description: 'Live practice with peer feedback and expert evaluation' },
];

const Countdown = ({ targetTime }) => {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const update = () => setDiff(Math.max(0, new Date(targetTime) - Date.now()));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [targetTime]);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (diff === 0) return <span className="badge badge-red">LIVE NOW</span>;
  return (
    <div className="font-mono text-green" style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>
      {d > 0 && `${d}d `}{String(h).padStart(2,'0')}h {String(m).padStart(2,'0')}m {String(s).padStart(2,'0')}s
    </div>
  );
};

export default function MeetSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeetSessions()
      .then(d => setSessions(d.filter(s => s.visible !== false).length > 0
        ? d.filter(s => s.visible !== false)
        : DEMO_SESSIONS))
      .catch(() => setSessions(DEMO_SESSIONS))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = sessions.filter(s => new Date(s.time) > new Date()).sort((a, b) => new Date(a.time) - new Date(b.time));
  const past = sessions.filter(s => new Date(s.time) <= new Date()).sort((a, b) => new Date(b.time) - new Date(a.time));

  if (loading) return <div className="loading-center"><div className="spinner" /><span>LOADING SESSIONS...</span></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <div className="section-icon">📅</div>
          <div>
            <h1>LIVE SESSIONS</h1>
            <p className="text-secondary">Scheduled Google Meet training sessions</p>
          </div>
        </div>

        {upcoming.length > 0 && (
          <div className="mb-3">
            <h3 className="mb-2 font-mono text-muted" style={{ fontSize: '0.8rem', letterSpacing: '0.2em' }}>UPCOMING SESSIONS</h3>
            <div className="grid-2">
              {upcoming.map((s, i) => (
                <div key={s.id || i} className="card corner-accent animate-fade" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge badge-green">UPCOMING</span>
                    <Countdown targetTime={s.time} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{s.title}</h3>
                  <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.8rem' }}>{s.description}</p>
                  <p className="font-mono text-muted" style={{ fontSize: '0.75rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>
                    {new Date(s.time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                  {s.link && s.link !== '#' && (
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                      JOIN SESSION →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {upcoming.length === 0 && (
          <div className="card text-center mb-3" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h3 className="text-muted">No upcoming sessions scheduled</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Check back soon for new sessions</p>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h3 className="mb-2 font-mono text-muted" style={{ fontSize: '0.8rem', letterSpacing: '0.2em' }}>PAST SESSIONS</h3>
            <div className="grid-2">
              {past.map((s, i) => (
                <div key={s.id || i} className="card" style={{ opacity: 0.6 }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge badge-blue">COMPLETED</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                  <p className="text-muted" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
                    {new Date(s.time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
