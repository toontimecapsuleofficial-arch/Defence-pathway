import {
  collection, doc, getDocs, getDoc, addDoc,
  updateDoc, deleteDoc, query, where, orderBy,
  serverTimestamp, setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';

// ─── Generic helpers ───────────────────────────────────────────────────────
export const getCollection = async (col, filters = []) => {
  let q = collection(db, col);
  if (filters.length) q = query(q, ...filters);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getDocById = async (col, id) => {
  const snap = await getDoc(doc(db, col, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const addDocument = async (col, data) => {
  return addDoc(collection(db, col), { ...data, createdAt: serverTimestamp() });
};

export const updateDocument = async (col, id, data) => {
  return updateDoc(doc(db, col, id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteDocument = async (col, id) => {
  return deleteDoc(doc(db, col, id));
};

// ─── GD Topics ─────────────────────────────────────────────────────────────
export const getGDTopics = () => getCollection('gd_topics');
export const addGDTopic = (data) => addDocument('gd_topics', data);
export const updateGDTopic = (id, data) => updateDocument('gd_topics', id, data);
export const deleteGDTopic = (id) => deleteDocument('gd_topics', id);

// ─── WAT Words ─────────────────────────────────────────────────────────────
export const getWATSets = () => getCollection('wat_words');
export const addWATSet = (data) => addDocument('wat_words', data);
export const updateWATSet = (id, data) => updateDocument('wat_words', id, data);
export const deleteWATSet = (id) => deleteDocument('wat_words', id);

// ─── SRT Sets ──────────────────────────────────────────────────────────────
export const getSRTSets = () => getCollection('srt_sets');
export const addSRTSet = (data) => addDocument('srt_sets', data);
export const updateSRTSet = (id, data) => updateDocument('srt_sets', id, data);
export const deleteSRTSet = (id) => deleteDocument('srt_sets', id);

// ─── PPDT Images ───────────────────────────────────────────────────────────
export const getPPDTImages = () => getCollection('ppdt_images');
export const addPPDTImage = (data) => addDocument('ppdt_images', data);
export const deletePPDTImage = (id) => deleteDocument('ppdt_images', id);

// ─── GTO Tasks ─────────────────────────────────────────────────────────────
export const getGTOTasks = () => getCollection('gto_tasks');
export const addGTOTask = (data) => addDocument('gto_tasks', data);
export const deleteGTOTask = (id) => deleteDocument('gto_tasks', id);

// ─── Lecturette Topics ─────────────────────────────────────────────────────
export const getLecturetteTopics = () => getCollection('lecturette_topics');
export const addLecturetteTopic = (data) => addDocument('lecturette_topics', data);
export const updateLecturetteTopic = (id, data) => updateDocument('lecturette_topics', id, data);
export const deleteLecturetteTopic = (id) => deleteDocument('lecturette_topics', id);

// ─── Google Meet Sessions ──────────────────────────────────────────────────
export const getMeetSessions = () => getCollection('google_meet_sessions');
export const addMeetSession = (data) => addDocument('google_meet_sessions', data);
export const updateMeetSession = (id, data) => updateDocument('google_meet_sessions', id, data);
export const deleteMeetSession = (id) => deleteDocument('google_meet_sessions', id);

// ─── YouTube Sessions ──────────────────────────────────────────────────────
export const getYTSessions = () => getCollection('youtube_sessions');
export const addYTSession = (data) => addDocument('youtube_sessions', data);
export const updateYTSession = (id, data) => updateDocument('youtube_sessions', id, data);
export const deleteYTSession = (id) => deleteDocument('youtube_sessions', id);

// ─── App Settings ──────────────────────────────────────────────────────────
export const getSettings = async () => {
  const snap = await getDoc(doc(db, 'settings', 'global'));
  return snap.exists() ? snap.data() : {
    lecturetteVisible: true,
    meetVisible: true,
    youtubeVisible: true,
    watInterval: 15,
    srtDuration: 30,
    lecturetteTimer: 3
  };
};
export const updateSettings = (data) => setDoc(doc(db, 'settings', 'global'), data, { merge: true });

// ─── Image Upload ──────────────────────────────────────────────────────────
export const uploadImage = async (file, folder) => {
  const r = ref(storage, `${folder}/${Date.now()}_${file.name}`);
  const snap = await uploadBytes(r, file);
  return getDownloadURL(snap.ref);
};

export const deleteImage = (url) => {
  const r = ref(storage, url);
  return deleteObject(r);
};

// ─── SRT Responses (user answers) ─────────────────────────────────────────
export const saveSRTResponse = (sessionId, data) =>
  addDocument('srt_responses', { sessionId, ...data });
