import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Workbench from './components/Workbench';
import ProjectList from './components/ProjectList';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';
import { User, ThemeMode, Language, Tenant } from './types';
import { MOCK_TENANTS, LOCALE } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [lang, setLang] = useState<Language>('zh');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [tenant, setTenant] = useState<Tenant>(MOCK_TENANTS[0]);

  // Handle Theme
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Simple Router Switch
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Workbench lang={lang} user={user!} />;
      case 'projects':
        return <ProjectList lang={lang} />;
      case 'image-editor':
        return <ImageEditor lang={lang} />;
      case 'video-generator':
        return <VideoGenerator lang={lang} />;
      default:
        // Placeholder for other modules
        const t = LOCALE[lang];
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 dark:text-gray-500">
             <div className="text-6xl font-bold opacity-10 mb-4">{activeMenu.toUpperCase()}</div>
             <p className="text-xl">Module Under Construction</p>
             <p className="mt-2 text-sm opacity-60">This part of Nebula LowCode is coming soon.</p>
          </div>
        );
    }
  };

  if (!user) {
    return (
      <Login 
        onLogin={setUser} 
        lang={lang} 
        setLang={setLang} 
        theme={theme} 
        setTheme={setTheme} 
      />
    );
  }

  return (
    <Layout
      user={user}
      theme={theme}
      setTheme={setTheme}
      lang={lang}
      setLang={setLang}
      onLogout={() => setUser(null)}
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
      tenant={tenant}
      setTenant={setTenant}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;