import React, { useState } from 'react';
import { 
  PlayCircle, 
  FolderKanban, 
  Rocket, 
  PlusCircle, 
  Download, 
  BookOpen, 
  FileText, 
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  Search
} from 'lucide-react';
import { LOCALE, MOCK_PROJECTS, TRAINING_VIDEOS, HELP_LINKS } from '../constants';
import { Language, User } from '../types';

interface WorkbenchProps {
  lang: Language;
  user: User;
}

const Workbench: React.FC<WorkbenchProps> = ({ lang, user }) => {
  const t = LOCALE[lang];
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = MOCK_PROJECTS.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{t.welcome}, {user.name}!</h1>
        <p className="opacity-90 max-w-2xl text-lg">{t.loginDesc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT COLUMN - Main Content (Recent Projects) - Now takes 3/4 width */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[500px]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FolderKanban className="text-purple-500" size={20}/>
                {t.recentProjects}
              </h2>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                   <input
                      type="text"
                      placeholder={t.searchProjects}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                   />
                </div>
                <button className="text-sm text-purple-600 dark:text-purple-400 hover:underline whitespace-nowrap hidden sm:block">{t.viewAll}</button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               
               {/* Add New Placeholder - Always First */}
               <div className="group p-5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-purple-500 min-h-[180px]">
                  <PlusCircle size={32} className="mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <span className="font-medium">{t.createProject}</span>
               </div>

               {/* Filtered Projects */}
               {filteredProjects.map(project => (
                 <div key={project.id} className="group p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all cursor-pointer bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl ${project.color} flex items-center justify-center text-white font-bold text-xl shadow-sm`}>
                        {project.name.substring(0,1)}
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium">
                        {project.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{project.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">{project.desc}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700/50">
                        <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                          <Clock size={12} /> {t.lastEdited}: {project.lastEdited}
                        </div>
                    </div>
                 </div>
               ))}

               {/* No Results State */}
               {filteredProjects.length === 0 && searchTerm && (
                 <div className="col-span-full md:col-span-2 lg:col-span-2 flex flex-col items-center justify-center py-10 text-gray-400">
                    <Search size={32} className="mb-2 opacity-50" />
                    <p>{t.noProjectsFound}</p>
                 </div>
               )}
               
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Sidebar (Quick Start & Help) - Now takes 1/4 width (implicit) */}
        <div className="space-y-6">
          
          {/* Newcomer Guide Link */}
          <a 
            href="https://guide.xingyunzuo.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 group relative overflow-hidden"
          >
             {/* Decorative background element */}
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
             
             <div className="flex items-center justify-between relative z-10">
               <div>
                 <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                   <Compass size={20} className="text-purple-100" />
                   {t.newcomerGuide}
                 </h3>
                 <p className="text-purple-100 text-xs opacity-90">{t.newcomerGuideDesc}</p>
               </div>
               <ExternalLink size={18} className="text-purple-200 group-hover:text-white transition-colors" />
             </div>
          </a>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
             <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
               <Rocket size={18} className="text-amber-500"/> {t.quickActions}
             </h3>
             <div className="grid grid-cols-2 gap-3">
               <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors border border-purple-100 dark:border-purple-800/50">
                 <PlusCircle size={24} className="mb-2"/>
                 <span className="text-xs font-medium">{t.createProject}</span>
               </button>
               <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-800/50">
                 <Download size={24} className="mb-2"/>
                 <span className="text-xs font-medium">{t.importProject}</span>
               </button>
             </div>
          </div>

          {/* Training Videos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
             <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
               <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                 <PlayCircle size={18} className="text-red-500"/> {t.trainingVideos}
               </h3>
             </div>
             <div className="divide-y divide-gray-100 dark:divide-gray-700">
               {TRAINING_VIDEOS.map(video => (
                 <div key={video.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center text-gray-400 group-hover:text-red-500 transition-colors relative">
                      <PlayCircle size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{video.title}</p>
                      <p className="text-xs text-gray-500">{t.videoDuration}: {video.duration}</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300" />
                 </div>
               ))}
             </div>
          </div>

          {/* User Manual / Help */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
             <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
               <BookOpen size={18} className="text-emerald-500"/> {t.userManual}
             </h3>
             <ul className="space-y-3">
               {HELP_LINKS.map(link => (
                 <li key={link.id}>
                   <a href="#" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                     <FileText size={16} className="opacity-70" />
                     {link.title}
                   </a>
                 </li>
               ))}
             </ul>
             <button className="w-full mt-4 py-2 text-xs font-medium text-center text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-300 transition-colors">
                {t.helpCenter}
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Workbench;