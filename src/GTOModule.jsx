import { useState, useEffect } from 'react';
import { getGTOTasks } from '../firebase/firestore';

const DEMO_TASKS = [
  { title: 'Progressive Group Task (PGT)', code: 'PGT', description: 'A series of obstacles requiring group coordination. The group must use provided materials (planks, ropes, drums) to cross obstacles without touching the ground within marked areas. Tests collective decision-making and leadership.', difficulty: 'MEDIUM', tags: ['Group', 'Coordination', 'Planning'] },
  { title: 'Half Group Task (HGT)', code: 'HGT', description: 'Similar to PGT but with half the group. Greater individual contribution is required. Smaller group size means each persons leadership and initiative is more visible.', difficulty: 'HIGH', tags: ['Leadership', 'Initiative', 'Problem Solving'] },
  { title: 'Individual Obstacles (IO)', code: 'IO', description: '10 obstacles to be attempted in any order over 3 minutes. Scored on difficulty — easier obstacles score 1-2 points, harder ones 3 points. Test individual physical ability and mental courage.', difficulty: 'HIGH', tags: ['Individual', 'Physical', 'Courage'] },
  { title: 'Command Task (CT)', code: 'CT', description: 'Candidate becomes the commander and selects 2 subordinates. Must solve an obstacle using materials provided. GTO evaluates command potential, communication, and respect for subordinates.', difficulty: 'CRITICAL', tags: ['Command', 'Leadership', 'Communication'] },
  { title: 'Final Group Task (FGT)', code: 'FGT', description: 'The last task done by the full group. Similar to PGT but may include a rescue element. GTO assesses how individuals perform after the competitive pressure of IO and Command Tasks.', difficulty: 'HIGH', tags: ['Group', 'Endurance', 'Cooperation'] },
];

const DIFF_COLORS = { LOW: 'green', MEDIUM: 'blue', HIGH: 'gold', CRITICAL: 'red' };

export default function GTOModule() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getGTOTasks()
      .then(d => setTasks(d.length > 0 ? d : DEMO_TASKS))
      .catch(() => setTasks(DEMO_TASKS))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /><span>LOADING GTO TASKS...</span></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <div className="section-icon">🪖</div>
          <div>
            <h1>GTO TASKS</h1>
            <p className="text-secondary">Group Task Obstacles — study each task structure and strategy</p>
          </div>
        </div>

        {selected ? (
          <div style={{ maxWidth: '700px' }}>
            <button onClick={() => setSelected(null)} className="btn btn-ghost btn-sm mb-3">← BACK TO TASKS</button>
            <div className="card corner-accent">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-muted" style={{ fontSize: '0.75rem', letterSpacing: '0.2em' }}>{selected.code}</span>
                <span className={`badge badge-${DIFF_COLORS[selected.difficulty] || 'green'}`}>{selected.difficulty}</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.05em', marginBottom: '1rem', color: 'var(--accent-bright)' }}>
                {selected.title}
              </h2>
              <div className="flex gap-1 mb-3">
                {(selected.tags || []).map(t => <span key={t} className="badge badge-blue">{t}</span>)}
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.9', fontSize: '1rem', marginBottom: '1.5rem' }}>
                {selected.description}
              </p>
              {selected.imageUrl && (
                <img src={selected.imageUrl} alt={selected.title} style={{ width: '100%', borderRadius: '2px', marginBottom: '1.5rem' }} />
              )}
              {selected.tips && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>STRATEGY TIPS</h3>
                  {selected.tips.map((tip, i) => (
                    <div key={i} className="srt-rule" style={{ marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--accent-green)' }}>✓</span>
                      <span style={{ fontSize: '0.95rem' }}>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="card mb-3" style={{ maxWidth: '800px' }}>
              <h3 className="text-gold mb-2">GTO SERIES OVERVIEW</h3>
              <p className="text-secondary" style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                The GTO (Group Testing Officer) series evaluates your leadership, teamwork, physical fitness, and decision-making through a series of outdoor group tasks. The complete GTO series includes PGT, HGT, IO, Lecturette, Command Task, Snake Race, and FGT.
              </p>
            </div>
            <div className="grid-2">
              {tasks.map((task, i) => (
                <div
                  key={task.id || i}
                  className="card animate-fade corner-accent"
                  style={{ cursor: 'pointer', animationDelay: `${i * 0.05}s`, opacity: 0 }}
                  onClick={() => setSelected(task)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-muted" style={{ fontSize: '0.7rem', letterSpacing: '0.2em' }}>{task.code}</span>
                    <span className={`badge badge-${DIFF_COLORS[task.difficulty] || 'green'}`}>{task.difficulty}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.7rem', letterSpacing: '0.03em' }}>
                    {task.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
                    {(task.description || '').slice(0, 120)}...
                  </p>
                  <div className="flex gap-1 flex-wrap mb-2">
                    {(task.tags || []).map(t => <span key={t} className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{t}</span>)}
                  </div>
                  <div className="gd-card-cta font-mono">VIEW DETAILS →</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
