import { useState, useEffect } from 'react';
import { getPPDTImages } from '../firebase/firestore';
import './PPDTModule.css';

const DEMO_IMAGES = [
  { title: 'Scene 1 — Ambiguous Outdoor', description: 'A blurred outdoor scene with multiple figures in an open field. Practice identifying characters, actions, and emotional tones.', themeHints: ['Initiative', 'Teamwork', 'Leadership'] },
  { title: 'Scene 2 — Indoor Setting', description: 'A dimly lit indoor environment with one prominent figure and others in the background. Focus on the mood and possible storyline.', themeHints: ['Problem Solving', 'Responsibility', 'Communication'] },
  { title: 'Scene 3 — Crisis Scenario', description: 'An image showing tension or urgency. Multiple characters are present. Identify the central figure and their role in resolving the situation.', themeHints: ['Courage', 'Decision Making', 'Resilience'] },
];

export default function PPDTModule() {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [storyMode, setStoryMode] = useState(false);
  const [story, setStory] = useState('');
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    getPPDTImages()
      .then(d => setImages(d.length > 0 ? d : DEMO_IMAGES))
      .catch(() => setImages(DEMO_IMAGES))
      .finally(() => setLoading(false));
  }, []);

  const startPractice = (img) => {
    setSelected(img);
    setFocusMode(true);
    setStoryMode(false);
    setStory('');
    // 30 sec to observe, then story mode
    let secs = 30;
    setTimeLeft(secs);
    const t = setInterval(() => {
      secs--;
      setTimeLeft(secs);
      if (secs <= 0) { clearInterval(t); setStoryMode(true); startStoryTimer(); }
    }, 1000);
    setTimer(t);
  };

  const startStoryTimer = () => {
    let secs = 240; // 4 minutes for story
    const t = setInterval(() => {
      secs--;
      setTimeLeft(secs);
      if (secs <= 0) clearInterval(t);
    }, 1000);
    setTimer(t);
  };

  const exitFocus = () => {
    if (timer) clearInterval(timer);
    setFocusMode(false);
    setStoryMode(false);
  };

  const random = () => startPractice(images[Math.floor(Math.random() * images.length)]);

  const mm = Math.floor(timeLeft / 60);
  const ss = timeLeft % 60;
  const timerStr = `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;

  if (loading) return <div className="loading-center"><div className="spinner" /><span>LOADING...</span></div>;

  if (focusMode && selected) {
    return (
      <div className="focus-mode ppdt-focus">
        <div className="ppdt-focus-bar">
          <div className="font-mono text-muted" style={{fontSize:'0.75rem',letterSpacing:'0.2em'}}>
            {storyMode ? 'WRITE YOUR STORY' : 'OBSERVE THE IMAGE'}
          </div>
          <span className={`timer-display ${timeLeft < 30 ? 'danger' : timeLeft < 60 ? 'warning' : ''}`}>
            {timerStr}
          </span>
          <button onClick={exitFocus} className="btn btn-ghost btn-sm">EXIT</button>
        </div>

        {!storyMode ? (
          <div className="ppdt-observe">
            <div className="ppdt-image-placeholder">
              {selected.imageUrl ? (
                <img src={selected.imageUrl} alt={selected.title} style={{maxWidth:'100%',maxHeight:'60vh',objectFit:'contain'}} />
              ) : (
                <div className="ppdt-placeholder-box">
                  <div className="ppdt-placeholder-icon">🖼️</div>
                  <p className="text-muted">{selected.title}</p>
                  <p className="text-secondary" style={{fontSize:'0.9rem',marginTop:'0.5rem'}}>{selected.description}</p>
                </div>
              )}
            </div>
            <div className="ppdt-hints">
              {(selected.themeHints || []).map(h => (
                <span key={h} className="badge badge-gold">{h}</span>
              ))}
            </div>
            <p className="text-muted font-mono" style={{fontSize:'0.75rem',letterSpacing:'0.2em'}}>
              OBSERVE CAREFULLY — STORY WRITING BEGINS AFTER {timeLeft}s
            </p>
          </div>
        ) : (
          <div className="ppdt-story-mode">
            <h3 className="text-green mb-2">{selected.title}</h3>
            <textarea
              value={story}
              onChange={e => setStory(e.target.value)}
              placeholder="Write your story here... Include: Who are the characters? What is happening? What led to this? What will happen next?"
              rows={12}
              style={{width:'100%',maxWidth:'700px',marginBottom:'1rem'}}
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={exitFocus} className="btn btn-primary">FINISH</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <div className="section-icon">🖼️</div>
          <div>
            <h1>PP&DT MODULE</h1>
            <p className="text-secondary">Picture Perception & Description Test practice</p>
          </div>
        </div>

        <div className="card ppdt-info mb-3">
          <h3 className="text-gold mb-2">PP&DT FORMAT</h3>
          <div className="grid-2">
            <div>
              <p className="text-secondary" style={{marginBottom:'1rem',lineHeight:'1.7'}}>
                In the actual PP&DT, you observe a blurred image for <strong>30 seconds</strong>, then write a story in <strong>4 minutes</strong>. Your story should have a past, present, and future with a clear hero.
              </p>
            </div>
            <div className="ppdt-tips">
              {['Identify the hero and their age/gender', 'Give the hero positive traits', 'Create a problem and decisive resolution', 'Ensure a positive, constructive ending', 'Avoid violence or negativity'].map(tip => (
                <div key={tip} className="srt-rule" style={{marginBottom:'0.4rem'}}>
                  <span className="text-green">✓</span><span style={{fontSize:'0.9rem'}}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <button onClick={random} className="btn btn-primary">🎲 RANDOM PRACTICE</button>
        </div>

        <div className="grid-3">
          {images.map((img, i) => (
            <div key={img.id || i} className="card ppdt-card" onClick={() => startPractice(img)} style={{cursor:'pointer'}}>
              <div className="ppdt-card-img">
                {img.imageUrl ? (
                  <img src={img.imageUrl} alt={img.title} />
                ) : (
                  <div className="ppdt-img-placeholder">🖼️</div>
                )}
              </div>
              <h3 className="ppdt-card-title">{img.title}</h3>
              <p className="text-secondary" style={{fontSize:'0.85rem',lineHeight:'1.5',marginBottom:'1rem'}}>{img.description}</p>
              <div className="flex gap-1 flex-wrap">
                {(img.themeHints || []).map(h => (
                  <span key={h} className="badge badge-gold" style={{fontSize:'0.65rem'}}>{h}</span>
                ))}
              </div>
              <div className="gd-card-cta font-mono mt-2">PRACTICE →</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
