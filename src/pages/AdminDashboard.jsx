import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import {
  getGDTopics, addGDTopic, updateGDTopic, deleteGDTopic,
  getWATSets, addWATSet, updateWATSet, deleteWATSet,
  getSRTSets, addSRTSet, deleteSRTSet,
  getPPDTImages, addPPDTImage, deletePPDTImage,
  getGTOTasks, addGTOTask, deleteGTOTask,
  getLecturetteTopics, addLecturetteTopic, deleteLecturetteTopic,
  getMeetSessions, addMeetSession, updateMeetSession, deleteMeetSession,
  getYTSessions, addYTSession, updateYTSession, deleteYTSession,
  updateSettings, uploadImage
} from '../firebase/firestore';
import './AdminDashboard.css';

const SECTIONS = [
  { id: 'overview', label: 'OVERVIEW', icon: '📊' },
  { id: 'gd', label: 'GD TOPICS', icon: '💬' },
  { id: 'wat', label: 'WAT WORDS', icon: '✍️' },
  { id: 'srt', label: 'SRT SETS', icon: '⚡' },
  { id: 'ppdt', label: 'PP&DT IMAGES', icon: '🖼️' },
  { id: 'gto', label: 'GTO TASKS', icon: '🪖' },
  { id: 'lecturette', label: 'LECTURETTE', icon: '🎤' },
  { id: 'meet', label: 'MEET SESSIONS', icon: '📅' },
  { id: 'youtube', label: 'YOUTUBE', icon: '📺' },
  { id: 'settings', label: 'SETTINGS', icon: '⚙️' },
];

// ── Modal wrapper ────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

// ── Confirm delete ───────────────────────────────────────────────────────────
const useConfirm = () => {
  const confirm = (msg) => window.confirm(msg);
  return confirm;
};

// ── GD Panel ────────────────────────────────────────────────────────────────
const GDPanel = () => {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();

  useEffect(() => { getGDTopics().then(setItems); }, []);

  const save = async () => {
    setSaving(true);
    const data = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    if (editing) await updateGDTopic(editing, data);
    else await addGDTopic(data);
    const updated = await getGDTopics();
    setItems(updated);
    setModal(false); setEditing(null); setForm({ title: '', content: '', tags: '' });
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this GD topic?')) return;
    await deleteGDTopic(id);
    setItems(items.filter(i => i.id !== id));
  };

  const edit = (item) => {
    setForm({ title: item.title || '', content: item.content || '', tags: (item.tags || []).join(', ') });
    setEditing(item.id); setModal(true);
  };

  return (
    <div>
      <div className="panel-header">
        <h2>GD TOPICS <span className="badge badge-green">{items.length}</span></h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ title: '', content: '', tags: '' }); setEditing(null); setModal(true); }}>+ ADD TOPIC</button>
      </div>
      <div className="admin-list">
        {items.map(item => (
          <div key={item.id} className="admin-list-item">
            <div className="ali-content">
              <strong>{item.title}</strong>
              <div className="flex gap-1 mt-1">
                {(item.tags || []).map(t => <span key={t} className="badge badge-green" style={{fontSize:'0.65rem'}}>{t}</span>)}
              </div>
              <p className="text-muted" style={{fontSize:'0.8rem',marginTop:'0.3rem'}}>{(item.content||'').slice(0,100)}...</p>
            </div>
            <div className="ali-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => edit(item)}>EDIT</button>
              <button className="btn btn-danger btn-sm" onClick={() => del(item.id)}>DELETE</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted text-center" style={{padding:'2rem'}}>No GD topics yet. Add your first one!</p>}
      </div>
      {modal && (
        <Modal title={editing ? 'EDIT GD TOPIC' : 'ADD GD TOPIC'} onClose={() => setModal(false)}>
          <div className="form-group"><label>TITLE</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Topic title" /></div>
          <div className="form-group"><label>CONTENT (500 words)</label><textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={8} placeholder="Full GD topic content..." /></div>
          <div className="form-group"><label>TAGS (comma separated)</label><input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="Defence, Society, Policy" /></div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'SAVING...' : 'SAVE'}</button>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>CANCEL</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── WAT Panel ────────────────────────────────────────────────────────────────
const WATPanel = () => {
  const [sets, setSets] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', words: '' });
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();

  useEffect(() => { getWATSets().then(setSets); }, []);

  const save = async () => {
    setSaving(true);
    const wordsArr = form.words.split('\n').map(w => w.trim().toUpperCase()).filter(Boolean);
    await addWATSet({ title: form.title, description: form.description, words: wordsArr });
    const updated = await getWATSets();
    setSets(updated); setModal(false); setForm({ title: '', description: '', words: '' });
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this WAT set?')) return;
    await deleteWATSet(id); setSets(sets.filter(s => s.id !== id));
  };

  return (
    <div>
      <div className="panel-header">
        <h2>WAT WORD SETS <span className="badge badge-green">{sets.length}</span></h2>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ ADD SET</button>
      </div>
      <div className="admin-list">
        {sets.map(set => (
          <div key={set.id} className="admin-list-item">
            <div className="ali-content">
              <strong>{set.title}</strong>
              <p className="text-muted" style={{fontSize:'0.8rem'}}>{(set.words||[]).length} words — {set.description}</p>
            </div>
            <div className="ali-actions">
              <button className="btn btn-danger btn-sm" onClick={() => del(set.id)}>DELETE</button>
            </div>
          </div>
        ))}
        {sets.length === 0 && <p className="text-muted text-center" style={{padding:'2rem'}}>No WAT sets yet.</p>}
      </div>
      {modal && (
        <Modal title="ADD WAT WORD SET" onClose={() => setModal(false)}>
          <div className="form-group"><label>SET TITLE</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. SSB Practice Set 1" /></div>
          <div className="form-group"><label>DESCRIPTION</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description" /></div>
          <div className="form-group">
            <label>WORDS (one per line, up to 60)</label>
            <textarea value={form.words} onChange={e => setForm({...form, words: e.target.value})} rows={10} placeholder="BRAVE&#10;LEADER&#10;COURAGE&#10;..." />
            <small className="text-muted">{form.words.split('\n').filter(Boolean).length} words entered</small>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'SAVING...' : 'SAVE SET'}</button>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>CANCEL</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── SRT Panel ────────────────────────────────────────────────────────────────
const SRTPanel = () => {
  const [sets, setSets] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', situations: '' });
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();

  useEffect(() => { getSRTSets().then(setSets); }, []);

  const save = async () => {
    setSaving(true);
    const sitsArr = form.situations.split('\n').map(s => s.trim()).filter(Boolean);
    await addSRTSet({ title: form.title, description: form.description, situations: sitsArr });
    const updated = await getSRTSets();
    setSets(updated); setModal(false); setForm({ title: '', description: '', situations: '' });
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this SRT set?')) return;
    await deleteSRTSet(id); setSets(sets.filter(s => s.id !== id));
  };

  return (
    <div>
      <div className="panel-header">
        <h2>SRT SETS <span className="badge badge-green">{sets.length}</span></h2>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ ADD SET</button>
      </div>
      <div className="admin-list">
        {sets.map(set => (
          <div key={set.id} className="admin-list-item">
            <div className="ali-content">
              <strong>{set.title}</strong>
              <p className="text-muted" style={{fontSize:'0.8rem'}}>{(set.situations||[]).length} situations</p>
            </div>
            <div className="ali-actions">
              <button className="btn btn-danger btn-sm" onClick={() => del(set.id)}>DELETE</button>
            </div>
          </div>
        ))}
        {sets.length === 0 && <p className="text-muted text-center" style={{padding:'2rem'}}>No SRT sets yet.</p>}
      </div>
      {modal && (
        <Modal title="ADD SRT SET" onClose={() => setModal(false)}>
          <div className="form-group"><label>SET TITLE</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. SRT Set 1" /></div>
          <div className="form-group"><label>DESCRIPTION</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description" /></div>
          <div className="form-group">
            <label>SITUATIONS (one per line, up to 60)</label>
            <textarea value={form.situations} onChange={e => setForm({...form, situations: e.target.value})} rows={10} placeholder="You are on patrol and your radio fails...&#10;During an exam you notice your friend cheating..." />
            <small className="text-muted">{form.situations.split('\n').filter(Boolean).length} situations entered</small>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'SAVING...' : 'SAVE SET'}</button>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>CANCEL</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── PPDT Panel ────────────────────────────────────────────────────────────────
const PPDTPanel = () => {
  const [images, setImages] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', themeHints: '', file: null });
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();

  useEffect(() => { getPPDTImages().then(setImages); }, []);

  const save = async () => {
    setSaving(true);
    try {
      let imageUrl = '';
      if (form.file) imageUrl = await uploadImage(form.file, 'ppdt');
      await addPPDTImage({
        title: form.title,
        description: form.description,
        themeHints: form.themeHints.split(',').map(t => t.trim()).filter(Boolean),
        imageUrl
      });
      const updated = await getPPDTImages();
      setImages(updated); setModal(false);
      setForm({ title: '', description: '', themeHints: '', file: null });
    } finally { setSaving(false); }
  };

  const del = async (id, url) => {
    if (!confirm('Delete this PPDT image?')) return;
    await deletePPDTImage(id); setImages(images.filter(i => i.id !== id));
  };

  return (
    <div>
      <div className="panel-header">
        <h2>PP&DT IMAGES <span className="badge badge-green">{images.length}</span></h2>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ ADD IMAGE</button>
      </div>
      <div className="ppdt-admin-grid">
        {images.map(img => (
          <div key={img.id} className="ppdt-admin-card">
            <div className="ppdt-admin-thumb">
              {img.imageUrl ? <img src={img.imageUrl} alt={img.title} /> : <span>🖼️</span>}
            </div>
            <p style={{fontSize:'0.85rem',fontWeight:700}}>{img.title}</p>
            <button className="btn btn-danger btn-sm" style={{marginTop:'0.5rem',width:'100%'}} onClick={() => del(img.id, img.imageUrl)}>DELETE</button>
          </div>
        ))}
        {images.length === 0 && <p className="text-muted">No PPDT images yet.</p>}
      </div>
      {modal && (
        <Modal title="ADD PP&DT IMAGE" onClose={() => setModal(false)}>
          <div className="form-group"><label>TITLE</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Scene title" /></div>
          <div className="form-group"><label>DESCRIPTION</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="Describe what's in the image..." /></div>
          <div className="form-group"><label>THEME HINTS (comma separated)</label><input value={form.themeHints} onChange={e => setForm({...form, themeHints: e.target.value})} placeholder="Leadership, Teamwork, Problem Solving" /></div>
          <div className="form-group">
            <label>UPLOAD IMAGE</label>
            <input type="file" accept="image/*" onChange={e => setForm({...form, file: e.target.files[0]})} />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'UPLOADING...' : 'SAVE'}</button>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>CANCEL</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── GTO Panel ────────────────────────────────────────────────────────────────
const GTOPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', code: '', description: '', difficulty: 'MEDIUM', tags: '' });
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();

  useEffect(() => { getGTOTasks().then(setTasks); }, []);

  const save = async () => {
    setSaving(true);
    await addGTOTask({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
    const updated = await getGTOTasks();
    setTasks(updated); setModal(false); setForm({ title: '', code: '', description: '', difficulty: 'MEDIUM', tags: '' });
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this GTO task?')) return;
    await deleteGTOTask(id); setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div>
      <div className="panel-header">
        <h2>GTO TASKS <span className="badge badge-green">{tasks.length}</span></h2>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ ADD TASK</button>
      </div>
      <div className="admin-list">
        {tasks.map(task => (
          <div key={task.id} className="admin-list-item">
            <div className="ali-content">
              <strong>{task.title}</strong>
              <span className={`badge badge-${task.difficulty === 'CRITICAL' ? 'red' : task.difficulty === 'HIGH' ? 'gold' : 'blue'}`} style={{marginLeft:'0.5rem',fontSize:'0.65rem'}}>{task.difficulty}</span>
            </div>
            <div className="ali-actions">
              <button className="btn btn-danger btn-sm" onClick={() => del(task.id)}>DELETE</button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-muted text-center" style={{padding:'2rem'}}>No GTO tasks yet.</p>}
      </div>
      {modal && (
        <Modal title="ADD GTO TASK" onClose={() => setModal(false)}>
          <div className="form-group"><label>TASK TITLE</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Progressive Group Task" /></div>
          <div className="form-group"><label>SHORT CODE</label><input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="PGT" /></div>
          <div className="form-group">
            <label>DIFFICULTY</label>
            <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
              {['LOW','MEDIUM','HIGH','CRITICAL'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group"><label>DESCRIPTION</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={5} /></div>
          <div className="form-group"><label>TAGS (comma separated)</label><input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="Group, Coordination, Planning" /></div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'SAVING...' : 'SAVE'}</button>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>CANCEL</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Lecturette Panel ──────────────────────────────────────────────────────────
const LecturettePanel = () => {
  const [topics, setTopics] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', category: '' });
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();

  useEffect(() => { getLecturetteTopics().then(setTopics); }, []);

  const save = async () => {
    setSaving(true);
    await addLecturetteTopic(form);
    const updated = await getLecturetteTopics();
    setTopics(updated); setModal(false); setForm({ title: '', category: '' });
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this topic?')) return;
    await deleteLecturetteTopic(id); setTopics(topics.filter(t => t.id !== id));
  };

  return (
    <div>
      <div className="panel-header">
        <h2>LECTURETTE TOPICS <span className="badge badge-green">{topics.length}</span></h2>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ ADD TOPIC</button>
      </div>
      <div className="admin-list">
        {topics.map(t => (
          <div key={t.id} className="admin-list-item">
            <div className="ali-content">
              <strong>{t.title}</strong>
              {t.category && <span className="badge badge-gold" style={{marginLeft:'0.5rem',fontSize:'0.65rem'}}>{t.category}</span>}
            </div>
            <div className="ali-actions">
              <button className="btn btn-danger btn-sm" onClick={() => del(t.id)}>DELETE</button>
            </div>
          </div>
        ))}
        {topics.length === 0 && <p className="text-muted text-center" style={{padding:'2rem'}}>No lecturette topics yet.</p>}
      </div>
      {modal && (
        <Modal title="ADD LECTURETTE TOPIC" onClose={() => setModal(false)}>
          <div className="form-group"><label>TOPIC TITLE</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Climate Change and National Security" /></div>
          <div className="form-group"><label>CATEGORY</label><input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. Defence, Technology, Society" /></div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'SAVING...' : 'SAVE'}</button>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>CANCEL</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Meet Sessions Panel ───────────────────────────────────────────────────────
const MeetPanel = () => {
  const [sessions, setSessions] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', link: '', time: '', description: '', visible: true });
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();

  useEffect(() => { getMeetSessions().then(setSessions); }, []);

  const save = async () => {
    setSaving(true);
    await addMeetSession(form);
    const updated = await getMeetSessions();
    setSessions(updated); setModal(false); setForm({ title: '', link: '', time: '', description: '', visible: true });
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this session?')) return;
    await deleteMeetSession(id); setSessions(sessions.filter(s => s.id !== id));
  };

  const toggleVisible = async (id, current) => {
    await updateMeetSession(id, { visible: !current });
    setSessions(sessions.map(s => s.id === id ? { ...s, visible: !current } : s));
  };

  return (
    <div>
      <div className="panel-header">
        <h2>MEET SESSIONS <span className="badge badge-green">{sessions.length}</span></h2>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ ADD SESSION</button>
      </div>
      <div className="admin-list">
        {sessions.map(s => (
          <div key={s.id} className="admin-list-item">
            <div className="ali-content">
              <strong>{s.title}</strong>
              <p className="text-muted" style={{fontSize:'0.8rem'}}>{s.time ? new Date(s.time).toLocaleString('en-IN') : 'No time set'}</p>
            </div>
            <div className="ali-actions">
              <button className={`btn btn-sm ${s.visible !== false ? 'btn-ghost' : 'btn-gold'}`} onClick={() => toggleVisible(s.id, s.visible !== false)}>
                {s.visible !== false ? '👁 VISIBLE' : '🙈 HIDDEN'}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => del(s.id)}>DELETE</button>
            </div>
          </div>
        ))}
        {sessions.length === 0 && <p className="text-muted text-center" style={{padding:'2rem'}}>No sessions yet.</p>}
      </div>
      {modal && (
        <Modal title="ADD MEET SESSION" onClose={() => setModal(false)}>
          <div className="form-group"><label>TITLE</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Session title" /></div>
          <div className="form-group"><label>GOOGLE MEET LINK</label><input value={form.link} onChange={e => setForm({...form, link: e.target.value})} placeholder="https://meet.google.com/..." /></div>
          <div className="form-group"><label>DATE & TIME</label><input type="datetime-local" value={form.time} onChange={e => setForm({...form, time: e.target.value})} /></div>
          <div className="form-group"><label>DESCRIPTION</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
          <div className="form-group" style={{display:'flex',alignItems:'center',gap:'0.8rem'}}>
            <input type="checkbox" id="vis" checked={form.visible} onChange={e => setForm({...form, visible: e.target.checked})} style={{width:'auto'}} />
            <label htmlFor="vis" style={{margin:0}}>VISIBLE TO USERS</label>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'SAVING...' : 'SAVE'}</button>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>CANCEL</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── YouTube Panel ─────────────────────────────────────────────────────────────
const YouTubePanel = () => {
  const [videos, setVideos] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', videoUrl: '', description: '', visible: true });
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();

  useEffect(() => { getYTSessions().then(setVideos); }, []);

  const save = async () => {
    setSaving(true);
    await addYTSession(form);
    const updated = await getYTSessions();
    setVideos(updated); setModal(false); setForm({ title: '', videoUrl: '', description: '', visible: true });
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this video?')) return;
    await deleteYTSession(id); setVideos(videos.filter(v => v.id !== id));
  };

  const toggleVisible = async (id, current) => {
    await updateYTSession(id, { visible: !current });
    setVideos(videos.map(v => v.id === id ? { ...v, visible: !current } : v));
  };

  return (
    <div>
      <div className="panel-header">
        <h2>YOUTUBE VIDEOS <span className="badge badge-green">{videos.length}</span></h2>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ ADD VIDEO</button>
      </div>
      <div className="admin-list">
        {videos.map(v => (
          <div key={v.id} className="admin-list-item">
            <div className="ali-content">
              <strong>{v.title}</strong>
              <p className="text-muted" style={{fontSize:'0.8rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'300px'}}>{v.videoUrl}</p>
            </div>
            <div className="ali-actions">
              <button className={`btn btn-sm ${v.visible !== false ? 'btn-ghost' : 'btn-gold'}`} onClick={() => toggleVisible(v.id, v.visible !== false)}>
                {v.visible !== false ? '👁 VISIBLE' : '🙈 HIDDEN'}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => del(v.id)}>DELETE</button>
            </div>
          </div>
        ))}
        {videos.length === 0 && <p className="text-muted text-center" style={{padding:'2rem'}}>No videos yet.</p>}
      </div>
      {modal && (
        <Modal title="ADD YOUTUBE VIDEO" onClose={() => setModal(false)}>
          <div className="form-group"><label>TITLE</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Video title" /></div>
          <div className="form-group"><label>YOUTUBE URL</label><input value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} placeholder="https://youtube.com/watch?v=..." /></div>
          <div className="form-group"><label>DESCRIPTION</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
          <div className="form-group" style={{display:'flex',alignItems:'center',gap:'0.8rem'}}>
            <input type="checkbox" id="vis2" checked={form.visible} onChange={e => setForm({...form, visible: e.target.checked})} style={{width:'auto'}} />
            <label htmlFor="vis2" style={{margin:0}}>VISIBLE TO USERS</label>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'SAVING...' : 'SAVE'}</button>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>CANCEL</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Settings Panel ────────────────────────────────────────────────────────────
const SettingsPanel = () => {
  const { settings, setSettings } = useSettings();
  const [form, setForm] = useState({ ...settings });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setForm({ ...settings }); }, [settings]);

  const save = async () => {
    setSaving(true);
    await updateSettings(form);
    setSettings(form);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (key) => setForm(f => ({ ...f, [key]: !f[key] }));

  return (
    <div style={{ maxWidth: '600px' }}>
      <div className="panel-header"><h2>PLATFORM SETTINGS</h2></div>

      {saved && <div className="alert alert-success">Settings saved successfully!</div>}

      <div className="card mb-3">
        <h3 className="mb-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
          MODULE VISIBILITY
        </h3>
        {[
          { key: 'lecturetteVisible', label: 'Lecturette Module', desc: 'Show/hide lecturette section to all users' },
          { key: 'meetVisible', label: 'Live Sessions (Meet)', desc: 'Show/hide Google Meet sessions section' },
          { key: 'youtubeVisible', label: 'Video Library (YouTube)', desc: 'Show/hide YouTube video section' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="settings-toggle">
            <div>
              <strong>{label}</strong>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>{desc}</p>
            </div>
            <button
              className={`toggle-btn ${form[key] ? 'on' : 'off'}`}
              onClick={() => toggle(key)}
            >
              {form[key] ? 'ON' : 'OFF'}
            </button>
          </div>
        ))}
      </div>

      <div className="card mb-3">
        <h3 className="mb-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
          TIMER CONFIGURATION
        </h3>
        <div className="form-group">
          <label>WAT WORD INTERVAL (seconds)</label>
          <input type="number" min="5" max="60" value={form.watInterval || 15}
            onChange={e => setForm({ ...form, watInterval: parseInt(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>SRT TOTAL DURATION (minutes)</label>
          <input type="number" min="10" max="60" value={form.srtDuration || 30}
            onChange={e => setForm({ ...form, srtDuration: parseInt(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>LECTURETTE SPEAKING TIME (minutes)</label>
          <input type="number" min="1" max="10" value={form.lecturetteTimer || 3}
            onChange={e => setForm({ ...form, lecturetteTimer: parseInt(e.target.value) })} />
        </div>
      </div>

      <button className="btn btn-primary" onClick={save} disabled={saving}>
        {saving ? 'SAVING...' : '💾 SAVE SETTINGS'}
      </button>
    </div>
  );
};

// ── Overview Panel ────────────────────────────────────────────────────────────
const OverviewPanel = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  return (
    <div>
      <div className="panel-header"><h2>COMMAND OVERVIEW</h2></div>
      <div className="overview-welcome card mb-3">
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎖️</div>
        <h3 className="text-green">Welcome, Commander</h3>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>{user?.email}</p>
      </div>
      <div className="overview-grid">
        {[
          { label: 'Lecturette', status: settings.lecturetteVisible ? 'ACTIVE' : 'HIDDEN', color: settings.lecturetteVisible ? 'green' : 'red' },
          { label: 'Live Sessions', status: settings.meetVisible ? 'ACTIVE' : 'HIDDEN', color: settings.meetVisible ? 'green' : 'red' },
          { label: 'Video Library', status: settings.youtubeVisible ? 'ACTIVE' : 'HIDDEN', color: settings.youtubeVisible ? 'green' : 'red' },
          { label: 'WAT Interval', status: `${settings.watInterval || 15}s`, color: 'blue' },
          { label: 'SRT Duration', status: `${settings.srtDuration || 30}min`, color: 'blue' },
          { label: 'Lecturette Timer', status: `${settings.lecturetteTimer || 3}min`, color: 'gold' },
        ].map(({ label, status, color }) => (
          <div key={label} className="card overview-stat">
            <p className="text-muted" style={{ fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>{label.toUpperCase()}</p>
            <span className={`badge badge-${color}`}>{status}</span>
          </div>
        ))}
      </div>
      <div className="alert alert-info mt-3">
        Use the sidebar to manage content across all modules. Changes take effect immediately for all users.
      </div>
    </div>
  );
};

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');

  const renderPanel = () => {
    switch (activeSection) {
      case 'overview': return <OverviewPanel />;
      case 'gd': return <GDPanel />;
      case 'wat': return <WATPanel />;
      case 'srt': return <SRTPanel />;
      case 'ppdt': return <PPDTPanel />;
      case 'gto': return <GTOPanel />;
      case 'lecturette': return <LecturettePanel />;
      case 'meet': return <MeetPanel />;
      case 'youtube': return <YouTubePanel />;
      case 'settings': return <SettingsPanel />;
      default: return null;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header font-mono">ADMIN PANEL</div>
        <nav className="admin-nav">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`admin-nav-btn ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="admin-content">
        <div className="admin-content-inner animate-fade" key={activeSection}>
          {renderPanel()}
        </div>
      </main>
    </div>
  );
}
