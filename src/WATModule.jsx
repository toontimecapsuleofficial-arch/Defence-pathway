import { useState, useEffect, useCallback, useRef } from 'react';
import { getWATSets } from '../firebase/firestore';
import { useSettings } from '../hooks/useSettings';
import './WATModule.css';

const DEMO_WORDS = [
  'BRAVE','LEADER','SOLDIER','MISSION','COURAGE','TEAM','HONOUR','STRENGTH',
  'VICTORY','DISCIPLINE','LOYALTY','SPIRIT','FREEDOM','PROTECT','NATION',
  'SACRIFICE','DUTY','COMMAND','BATTLE','RESOLVE','UNITY','TRUST','POWER',
  'DETERMINATION','SUCCESS','CHALLENGE','FEAR','ENEMY','STRATEGY','ADAPT',
  'SURVIVE','CONQUER','DEFEND','ADVANCE','RETREAT','AMBUSH','PATROL','GUARD',
  'WARRIOR','HERO','PEACE','JUSTICE','INTEGRITY','RESILIENCE','ENDURANCE',
  'VIGILANCE','SERVICE','PRIDE','FAITH','GLORY','RANK','ORDER','TRAINING',
  'INITIATIVE','PERSEVERANCE','OBSTACLE','PRESSURE','CALM','FOCUS','SWIFT'
];

export default function WATModule() {
  const { settings } = useSettings();
  const interval = settings.watInterval || 15;

  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [words, setWords] = useState([]);
  const [phase, setPhase] = useState('select'); // select | ready | active | done
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(interval);
  const [responses, setResponses] = useState({});
  const [currentInput, setCurrentInput] = useState('');
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    getWATSets()
      .then(d => setSets(d))
      .catch(() => setSets([]));
  }, []);

  const startSession = (wordList) => {
    setWords(wordList);
    setCurrentIdx(0);
    setTimeLeft(interval);
    setResponses({});
    setCurrentInput('');
    setPhase('ready');
  };

  const beginTest = () => {
    setPhase('active');
    inputRef.current?.focus();
  };

  const advance = useCallback(() => {
    setResponses(prev => ({ ...prev, [currentIdx]: currentInput }));
    setCurrentInput('');
    setCurrentIdx(prev => {
      const next = prev + 1;
      if (next >= words.length) {
        setPhase('done');
        clearInterval(timerRef.current);
        return prev;
      }
      setTimeLeft(interval);
      return next;
    });
  }, [currentIdx, currentInput, words.length, interval]);

  useEffect(() => {
    if (phase !== 'active') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { advance(); return interval; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, advance, interval]);

  useEffect(() => {
    if (phase === 'active') inputRef.current?.focus();
  }, [currentIdx, phase]);

  const handleKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); advance(); }
  };

  const timerClass = timeLeft <= 3 ? 'danger' : timeLeft <= 7 ? 'warning' : '';
  const progress = ((currentIdx) / words.length) * 100;

  // ── SELECT PHASE ──
  if (phase === 'select') {
    return (
      <div className="page">
        <div className="container">
          <div className="section-header">
            <div className="section-icon">✍️</div>
            <div>
              <h1>WORD ASSOCIATION TEST</h1>
              <p className="text-secondary">60 words • 15 seconds each • Auto-progression</p>
            </div>
          </div>

          <div className="wat-info-card card mb-3">
            <h3 className="text-gold mb-2">HOW IT WORKS</h3>
            <div className="wat-rules">
              {[
                `One word appears for ${interval} seconds`,
                'Write the FIRST sentence that comes to your mind',
                'System auto-advances — no pausing',
                'Answer reflects your personality & values',
                'Think positive, confident, and decisive'
              ].map((r, i) => (
                <div key={i} className="wat-rule">
                  <span className="rule-num font-mono">{String(i+1).padStart(2,'0')}</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          <h3 className="mb-2">SELECT A SET</h3>
          <div className="grid-2 mb-3">
            {sets.length > 0 ? sets.map(s => (
              <div key={s.id} className="card" style={{ cursor: 'pointer' }} onClick={() => startSession(s.words || [])}>
                <div className="flex items-center justify-between mb-1">
                  <h3>{s.title || 'WAT Set'}</h3>
                  <span className="badge badge-green">{(s.words || []).length} WORDS</span>
                </div>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>{s.description || 'Standard WAT practice set'}</p>
              </div>
            )) : (
              <div className="card" style={{ cursor: 'pointer' }} onClick={() => startSession(DEMO_WORDS)}>
                <div className="flex items-center justify-between mb-1">
                  <h3>DEMO SET — SSB PRACTICE</h3>
                  <span className="badge badge-gold">60 WORDS</span>
                </div>
                <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Classic SSB word association training set</p>
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={() => startSession(DEMO_WORDS)}>
            ▶ START DEMO SESSION
          </button>
        </div>
      </div>
    );
  }

  // ── READY PHASE ──
  if (phase === 'ready') {
    return (
      <div className="focus-mode">
        <div className="ready-panel corner-accent">
          <div className="font-mono text-muted mb-2" style={{ letterSpacing: '0.3em', fontSize: '0.8rem' }}>WAT SESSION READY</div>
          <h1 className="text-green" style={{ fontSize: '4rem', marginBottom: '1rem' }}>✍️</h1>
          <h2 className="mb-2">{words.length} WORDS — {interval}s EACH</h2>
          <p className="text-secondary mb-3" style={{ textAlign: 'center', maxWidth: '360px' }}>
            A word will appear. Write a sentence using it. System advances automatically after {interval} seconds.
          </p>
          <div className="flex gap-2">
            <button onClick={beginTest} className="btn btn-primary">BEGIN TEST</button>
            <button onClick={() => setPhase('select')} className="btn btn-ghost">BACK</button>
          </div>
        </div>
      </div>
    );
  }

  // ── DONE PHASE ──
  if (phase === 'done') {
    const answered = Object.values(responses).filter(Boolean).length;
    return (
      <div className="page">
        <div className="container">
          <div className="done-panel card text-center">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h1 className="text-green mb-2">SESSION COMPLETE</h1>
            <p className="text-secondary mb-3">WAT session completed — {answered} of {words.length} words answered</p>
            <div className="grid-3 mb-3">
              <div className="stat-box"><span className="font-mono text-green" style={{fontSize:'1.8rem'}}>{words.length}</span><span className="text-muted">TOTAL WORDS</span></div>
              <div className="stat-box"><span className="font-mono text-gold" style={{fontSize:'1.8rem'}}>{answered}</span><span className="text-muted">ANSWERED</span></div>
              <div className="stat-box"><span className="font-mono text-red" style={{fontSize:'1.8rem'}}>{words.length - answered}</span><span className="text-muted">SKIPPED</span></div>
            </div>
            <div className="wat-review mb-3">
              <h3 className="mb-2 text-left">YOUR RESPONSES</h3>
              {words.map((w, i) => (
                <div key={i} className="review-item">
                  <span className="review-word">{w}</span>
                  <span className="review-response">{responses[i] || <em className="text-muted">—no response—</em>}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => startSession(words)} className="btn btn-primary">RETRY</button>
              <button onClick={() => setPhase('select')} className="btn btn-ghost">HOME</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ACTIVE PHASE ──
  return (
    <div className="wat-active">
      {/* Top bar */}
      <div className="wat-topbar">
        <span className="font-mono text-muted">{currentIdx + 1} / {words.length}</span>
        <div className="progress-bar" style={{ width: '200px' }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className={`timer-display ${timerClass}`}>{String(timeLeft).padStart(2,'0')}s</span>
      </div>

      {/* Word display */}
      <div className="wat-word-container">
        <div className="wat-word-card">
          <div className="font-mono text-muted mb-2" style={{ letterSpacing: '0.3em', fontSize: '0.8rem' }}>WORD {String(currentIdx+1).padStart(2,'0')}</div>
          <div className="wat-word">{words[currentIdx]}</div>
          <div className="word-timer-bar">
            <div
              className={`word-timer-fill ${timerClass}`}
              style={{ width: `${(timeLeft / interval) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="wat-input-area">
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={e => setCurrentInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Write your sentence here... (Enter to advance)"
          className="wat-input"
          autoComplete="off"
          spellCheck="false"
        />
        <button onClick={advance} className="btn btn-primary">NEXT →</button>
      </div>

      <div className="text-center text-muted font-mono" style={{ fontSize: '0.75rem', marginTop: '1rem', letterSpacing: '0.2em' }}>
        AUTO-ADVANCES IN {timeLeft}s • PRESS ENTER TO ADVANCE EARLY
      </div>
    </div>
  );
}
