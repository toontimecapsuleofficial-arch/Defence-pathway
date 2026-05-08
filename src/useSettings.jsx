import { createContext, useContext, useEffect, useState } from 'react';
import { getSettings } from '../firebase/firestore';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    lecturetteVisible: true,
    meetVisible: true,
    youtubeVisible: true,
    watInterval: 15,
    srtDuration: 30,
    lecturetteTimer: 3
  });

  useEffect(() => {
    getSettings().then(s => setSettings(s)).catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
