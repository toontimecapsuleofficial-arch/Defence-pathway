import { useState, useEffect } from 'react';
import { getYTSessions } from '../firebase/firestore';

const DEMO_VIDEOS = [
  { title: 'Complete SSB WAT & SRT Strategy', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Comprehensive guide to WAT and SRT with response frameworks' },
  { title: 'GTO Tasks Explained', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Complete breakdown of all GTO tasks with expert tips' },
  { title: 'Lecturette — How to Score High', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Structure your lecturette for maximum impact' },
];

const getYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
};

const getEmbedUrl = (url) => {
  if (url?.includes('embed')) return url;
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
};

export default function YoutubeSessions() {
  const [videos, setVideos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getYTSessions()
      .then(d => setVideos(d.filter(v => v.visible !== false).length > 0
        ? d.filter(v => v.visible !== false)
        : DEMO_VIDEOS))
      .catch(() => setVideos(DEMO_VIDEOS))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /><span>LOADING VIDEOS...</span></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <div className="section-icon">📺</div>
          <div>
            <h1>VIDEO LIBRARY</h1>
            <p className="text-secondary">Curated training videos and expert sessions</p>
          </div>
        </div>

        {selected && (
          <div className="mb-3">
            <button onClick={() => setSelected(null)} className="btn btn-ghost btn-sm mb-2">← BACK TO LIBRARY</button>
            <div className="card" style={{ maxWidth: '800px' }}>
              <div className="yt-embed-wrapper" style={{ position: 'relative', paddingTop: '56.25%', marginBottom: '1rem', background: '#000' }}>
                <iframe
                  src={getEmbedUrl(selected.videoUrl)}
                  title={selected.title}
                  frameBorder="0"
                  allowFullScreen
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{selected.title}</h2>
              <p className="text-secondary">{selected.description}</p>
            </div>
          </div>
        )}

        <div className="grid-3">
          {videos.map((vid, i) => {
            const thumbId = getYouTubeId(vid.videoUrl);
            return (
              <div
                key={vid.id || i}
                className="card animate-fade"
                style={{ cursor: 'pointer', animationDelay: `${i * 0.04}s`, opacity: 0 }}
                onClick={() => setSelected(vid)}
              >
                <div className="yt-thumb" style={{
                  background: thumbId ? 'none' : 'var(--bg-secondary)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginBottom: '1rem',
                  aspectRatio: '16/9',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {thumbId ? (
                    <img
                      src={`https://img.youtube.com/vi/${thumbId}/mqdefault.jpg`}
                      alt={vid.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '2.5rem', opacity: 0.3 }}>▶</span>
                  )}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s'
                  }} className="yt-play-overlay">
                    <span style={{ fontSize: '3rem' }}>▶</span>
                  </div>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.03em', marginBottom: '0.5rem' }}>
                  {vid.title}
                </h3>
                <p className="text-secondary" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>{vid.description}</p>
                <div className="gd-card-cta font-mono mt-2">WATCH NOW →</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
