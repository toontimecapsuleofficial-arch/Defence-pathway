import { useState, useEffect, useRef, useCallback } from 'react';
import { getSRTSets, saveSRTResponse } from '../firebase/firestore';
import { useSettings } from '../hooks/useSettings';
import './SRTModule.css';

const DEMO_SITUATIONS = [
  "You are the team leader on a jungle trek. Your team member twists his ankle badly and cannot walk. It will be dark in 2 hours.",
  "During your final exam, you notice your best friend cheating. The examiner hasn't noticed. What do you do?",
  "You are driving alone on a highway at night. You see a car accident. No one else is around. What do you do?",
  "Your commanding officer gives you an order that you believe is tactically wrong and may endanger your team.",
  "You discover that a colleague has been falsifying reports to get a promotion. He has a family to support.",
  "You are on patrol and your radio fails. Your team gets separated in dense forest. It is getting dark.",
  "During a flood relief operation, you have supplies for only 50 people but 80 have gathered. What do you do?",
  "Your subordinate makes a serious error during a training exercise that results in a minor injury to another recruit.",
  "You are the only officer present when a fight breaks out between two groups of soldiers over a personal dispute.",
  "You notice that senior officers at your mess are routinely billing personal expenses to official accounts.",
  "During a mountain rescue mission, a team member panics and refuses to continue. The mission deadline is critical.",
  "You are assigned to a remote posting. Your family is facing a serious medical emergency back home.",
  "A local civilian approaches you with information about suspicious activity in the area. He demands money for it.",
  "Your unit wins a competition due to a mistake in the referee's scoring. The actual winner was a rival unit.",
  "You are tasked with delivering a speech to 500 soldiers but learn about it only 30 minutes before the event.",
  "During a combat exercise, you find that your ammunition has been incorrectly labeled and could be dangerous.",
  "A brilliant but arrogant junior officer under your command consistently delivers results but demoralizes the team.",
  "You discover that essential medical supplies meant for a field hospital have been diverted by corrupt officials.",
  "Your team must cross a flooded river. The bridge is damaged. You have rope, timber, and 2 hours.",
  "You are leading a night patrol. You hear gunfire in the distance. Your orders were to avoid engagement.",
  "A new recruit from a different cultural background is being bullied subtly by older members of your team.",
  "During a VIP escort duty, your vehicle breaks down in an unfamiliar area 20 km from the destination.",
  "You are in charge of a camp. Half the team falls ill due to contaminated water. Medical help is 4 hours away.",
  "You find a soldier in your unit suffering from depression and hinting at self-harm. He refuses official help.",
  "A civilian contractor reveals that substandard materials were used in constructing the base's boundary wall.",
  "You are the first to arrive at the scene of a road accident involving two military vehicles. There are casualties.",
  "Your commanding officer is clearly intoxicated while issuing critical operational orders before a night exercise.",
  "You have been wrongly accused of financial irregularity by a junior officer who is the CO's favourite.",
  "You are deep in enemy territory with a captured document. Your radio is damaged. What is your priority action?",
  "Your platoon is caught in heavy rain during a long march. Three soldiers collapse from exhaustion.",
  "During peacetime, you discover your unit has been stockpiling unauthorized weapons in a storage facility.",
  "A journalist is pressing you for classified information, claiming it is in the national interest to reveal it.",
  "Your newly joined subordinate shows exceptional ability but is constantly undermined by a jealous senior NCO.",
  "You are conducting recruitment interviews. Your superior pressures you to select his relative who is unqualified.",
  "Half your team wants to abort a difficult training mission due to fatigue. You believe it is achievable.",
  "While processing accounts, you discover a senior officer has been drawing pay for two fictional soldiers.",
  "You are the only officer available. A soldier is critically injured in an accident. No doctor is present.",
  "During a ceremonial parade, you notice a fire starting in an adjacent building. The parade is for a VIP dignitary.",
  "A foreign diplomat asks you about your unit's deployment schedule at an official function. How do you respond?",
  "Your entire platoon fails an important assessment. Your CO blames you publicly in front of the whole unit.",
  "You receive intelligence that an attack will happen in 6 hours. Your senior officer is unreachable.",
  "A soldier under your command is caught in possession of drugs. He claims it was planted by a rival.",
  "You are asked to sign a document certifying work that was not completed as per standards. The deadline is crucial.",
  "During a long sea voyage, morale drops drastically among your crew. Food supplies are running low.",
  "You must choose between completing a dangerous solo mission and staying to care for an injured comrade.",
  "A hostile crowd surrounds your military convoy. Tempers are rising. Backup is 45 minutes away.",
  "You discover your unit's radio frequencies may have been compromised by an internal leak.",
  "Your superior takes credit for an initiative that was entirely your idea, in front of senior officers.",
  "A critically important file is missing before a court of inquiry. You last saw it with your clerk.",
  "You are selected for a coveted foreign training program but it conflicts with your sister's wedding."
];

export default function SRTModule() {
  const { settings } = useSettings();
  const totalMinutes = settings.srtDuration || 30;

  const [sets, setSets] = useState([]);
  const [situations, setSituations] = useState([]);
  const [phase, setPhase] = useState('select');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState({});
  const [currentInput, setCurrentInput] = useState('');
  const [totalTimeLeft, setTotalTimeLeft] = useState(totalMinutes * 60);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    getSRTSets().then(d => setSets(d)).catch(() => {});
  }, []);

  const startSession = (sits) => {
    setSituations(sits);
    setCurrentIdx(0);
    setResponses({});
    setCurrentInput('');
    setTotalTimeLeft(totalMinutes * 60);
    setPhase('ready');
  };

  const beginTest = () => {
    setPhase('active');
    textareaRef.current?.focus();
  };

  useEffect(() => {
    if (phase !== 'active') return;
    timerRef.current = setInterval(() => {
      setTotalTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); endSession(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const endSession = useCallback(() => {
    setResponses(prev => ({ ...prev, [currentIdx]: currentInput }));
    setPhase('done');
    clearInterval(timerRef.current);
  }, [currentIdx, currentInput]);

  const saveAndNext = () => {
    setResponses(prev => ({ ...prev, [currentIdx]: currentInput }));
    if (currentIdx + 1 >= situations.length) { endSession(); return; }
    setCurrentIdx(i => i + 1);
    setCurrentInput('');
    textareaRef.current?.focus();
  };

  const saveAndPrev = () => {
    setResponses(prev => ({ ...prev, [currentIdx]: currentInput }));
    if (currentIdx === 0) return;
    setCurrentIdx(i => i - 1);
    setCurrentInput(responses[currentIdx - 1] || '');
    textareaRef.current?.focus();
  };

  // Format time
  const mm = Math.floor(totalTimeLeft / 60);
  const ss = totalTimeLeft % 60;
  const timeStr = `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  const timerClass = mm < 5 ? 'danger' : mm < 10 ? 'warning' : '';
  const progress = ((currentIdx) / situations.length) * 100;

  // ── SELECT ──
  if (phase === 'select') return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <div className="section-icon">⚡</div>
          <div>
            <h1>SITUATION REACTION TEST</h1>
            <p className="text-secondary">60 situations • {totalMinutes} minutes total • Timed session</p>
          </div>
        </div>
        <div className="card srt-info mb-3">
          <h3 className="text-gold mb-2">TEST GUIDELINES</h3>
          <div className="srt-rules">
            {[
              `${situations.length || 60} situations must be answered in ${totalMinutes} minutes`,
              'Write your FIRST instinctive reaction — avoid over-thinking',
              'Responses should be positive, decisive, and practical',
              'You can navigate between questions',
              'Timer runs continuously — manage your time wisely'
            ].map((r, i) => (
              <div key={i} className="srt-rule">
                <span className="font-mono text-green">{'>'}</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid-2 mb-3">
          {sets.length > 0 ? sets.map(s => (
            <div key={s.id} className="card" style={{cursor:'pointer'}} onClick={() => startSession(s.situations || [])}>
              <div className="flex items-center justify-between mb-1">
                <h3>{s.title || 'SRT Set'}</h3>
                <span className="badge badge-green">{(s.situations || []).length} SITS</span>
              </div>
              <p className="text-secondary" style={{fontSize:'0.9rem'}}>{s.description || 'Standard SRT practice set'}</p>
            </div>
          )) : (
            <div className="card" style={{cursor:'pointer'}} onClick={() => startSession(DEMO_SITUATIONS)}>
              <div className="flex items-center justify-between mb-1">
                <h3>DEMO SET — STANDARD SRT</h3>
                <span className="badge badge-gold">50 SITUATIONS</span>
              </div>
              <p className="text-secondary" style={{fontSize:'0.9rem'}}>SSB-standard situation reaction test practice</p>
            </div>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => startSession(DEMO_SITUATIONS)}>▶ START DEMO SRT</button>
      </div>
    </div>
  );

  // ── READY ──
  if (phase === 'ready') return (
    <div className="focus-mode">
      <div className="ready-panel corner-accent" style={{textAlign:'center',padding:'3rem',background:'var(--bg-card)',border:'1px solid var(--border-bright)',maxWidth:'500px',width:'100%'}}>
        <div className="font-mono text-muted mb-2" style={{letterSpacing:'0.3em',fontSize:'0.8rem'}}>SRT READY</div>
        <h1 style={{fontSize:'4rem',marginBottom:'1rem'}}>⚡</h1>
        <h2 className="mb-2">{situations.length} SITUATIONS — {totalMinutes} MINUTES</h2>
        <div className="timer-display mb-2" style={{fontSize:'3rem'}}>{timeStr}</div>
        <p className="text-secondary mb-3" style={{maxWidth:'360px'}}>
          Write your first instinctive reaction to each situation. The timer starts when you click BEGIN.
        </p>
        <div className="flex gap-2 justify-center">
          <button onClick={beginTest} className="btn btn-primary">BEGIN TEST</button>
          <button onClick={() => setPhase('select')} className="btn btn-ghost">BACK</button>
        </div>
      </div>
    </div>
  );

  // ── DONE ──
  if (phase === 'done') {
    const answered = Object.values(responses).filter(Boolean).length;
    return (
      <div className="page"><div className="container">
        <div className="card text-center mb-3">
          <div style={{fontSize:'4rem',marginBottom:'1rem'}}>✅</div>
          <h1 className="text-green mb-2">SRT COMPLETE</h1>
          <p className="text-secondary mb-3">{answered} of {situations.length} situations answered</p>
          <div className="grid-3 mb-3">
            <div className="stat-box"><span className="font-mono text-green" style={{fontSize:'1.8rem'}}>{situations.length}</span><span className="text-muted">TOTAL</span></div>
            <div className="stat-box"><span className="font-mono text-gold" style={{fontSize:'1.8rem'}}>{answered}</span><span className="text-muted">ANSWERED</span></div>
            <div className="stat-box"><span className="font-mono text-red" style={{fontSize:'1.8rem'}}>{situations.length - answered}</span><span className="text-muted">SKIPPED</span></div>
          </div>
        </div>
        <div className="srt-review">
          {situations.map((sit, i) => (
            <div key={i} className="srt-review-item">
              <div className="sit-num font-mono">SIT {String(i+1).padStart(2,'0')}</div>
              <div className="sit-text">{sit}</div>
              <div className="sit-response">{responses[i] || <em className="text-muted">Not answered</em>}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => startSession(situations)} className="btn btn-primary">RETRY</button>
          <button onClick={() => setPhase('select')} className="btn btn-ghost">HOME</button>
        </div>
      </div></div>
    );
  }

  // ── ACTIVE ──
  return (
    <div className="srt-active">
      {/* Header */}
      <div className="srt-header">
        <span className="font-mono text-muted">SRT — {situations.length} SITUATIONS</span>
        <div className="progress-bar" style={{width:'200px'}}>
          <div className="progress-fill" style={{width:`${progress}%`}} />
        </div>
        <span className={`timer-display ${timerClass}`} style={{fontSize:'1.5rem'}}>{timeStr}</span>
        <button onClick={endSession} className="btn btn-ghost btn-sm">SUBMIT</button>
      </div>

      <div className="srt-content">
        <div className="srt-sidebar">
          <div className="font-mono text-muted mb-2" style={{fontSize:'0.7rem',letterSpacing:'0.2em'}}>QUESTIONS</div>
          <div className="srt-index">
            {situations.map((_, i) => (
              <button
                key={i}
                className={`srt-idx-btn ${i === currentIdx ? 'current' : ''} ${responses[i] ? 'answered' : ''}`}
                onClick={() => {
                  setResponses(prev => ({...prev, [currentIdx]: currentInput}));
                  setCurrentIdx(i);
                  setCurrentInput(responses[i] || '');
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="srt-main">
          <div className="srt-question">
            <div className="srt-q-num font-mono">SITUATION {String(currentIdx+1).padStart(2,'0')} / {situations.length}</div>
            <p className="srt-q-text">{situations[currentIdx]}</p>
          </div>
          <div className="form-group">
            <label>YOUR RESPONSE</label>
            <textarea
              ref={textareaRef}
              value={currentInput}
              onChange={e => setCurrentInput(e.target.value)}
              placeholder="Write your immediate reaction here..."
              rows={5}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={saveAndPrev} disabled={currentIdx === 0} className="btn btn-ghost">← PREV</button>
            <button onClick={saveAndNext} className="btn btn-primary">
              {currentIdx + 1 === situations.length ? 'SUBMIT' : 'NEXT →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
