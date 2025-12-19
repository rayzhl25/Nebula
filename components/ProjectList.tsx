import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List as ListIcon, 
  MoreVertical, 
  Github, 
  Clock, 
  Trash2, 
  Edit,
  FolderOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MOCK_PROJECTS, LOCALE } from '../constants';
import { Language } from '../types';

interface ProjectListProps {
  lang: Language;
}

const ProjectList: React.FC<ProjectListProps> = ({ lang }) => {
  const t = LOCALE[lang];
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  
  // Stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'Active' || p.status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;

  // Filter Logic
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: number) => {
    if (window.confirm(t.deleteConfirm)) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Review': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Mock function for Create (Visual only in this view)
  const handleCreate = () => {
    const newProject = {
      id: Date.now(),
      name: `New Project ${projects.length + 1}`,
      desc: 'Automatically generated project description for demonstration.',
      status: 'Draft',
      lastEdited: 'Just now',
      color: 'bg-nebula-500'
    };
    setProjects([newProject, ...projects]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
             <FolderOpen className="text-nebula-500" />
             {t.projects}
           </h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage all your low-code applications in one place.</p>
        </div>
        
        {/* Simple Stats Cards */}
        <div className="flex gap-4">
           <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center min-w-[100px]">
              <span className="text-2xl font-bold text-gray-800 dark:text-white">{totalProjects}</span>
              <span className="text-xs text-gray-500 uppercase">{t.totalProjects}</span>
           </div>
           <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center min-w-[100px]">
              <span className="text-2xl font-bold text-nebula-600 dark:text-nebula-400">{activeProjects}</span>
              <span className="text-xs text-gray-500 uppercase">{t.activeProjects}</span>
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search & Filter */}
        <div className="flex flex-1 w-full gap-3">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder={t.searchProjects} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-nebula-500 outline-none transition-all text-gray-700 dark:text-gray-200"
              />
           </div>
           <select 
             value={statusFilter} 
             onChange={(e) => setStatusFilter(e.target.value)}
             className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-nebula-500"
           >
             <option value="All">{t.filterAll}</option>
             <option value="Active">Active</option>
             <option value="In Progress">In Progress</option>
             <option value="Draft">Draft</option>
           </select>
        </div>

        {/* Actions & View Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-nebula-400' : 'text-gray-400 hover:text-gray-600'}`}
                title={t.viewGrid}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-nebula-400' : 'text-gray-400 hover:text-gray-600'}`}
                title={t.viewList}
              >
                <ListIcon size={18} />
              </button>
           </div>
           
           <button 
             onClick={handleCreate}
             className="flex items-center gap-2 bg-nebula-600 hover:bg-nebula-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-nebula-600/20"
           >
             <Plus size={18} />
             <span className="hidden sm:inline">{t.createProject}</span>
           </button>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
           <FolderOpen className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
           <p className="text-gray-500 dark:text-gray-400 text-lg">{t.noProjectsFound}</p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map(project => (
            <div key={project.id} className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-nebula-500 dark:hover:border-nebula-500 transition-all hover:shadow-lg flex flex-col h-full relative overflow-hidden">
               {/* Color Bar */}
               <div className={`h-2 w-full ${project.color}`}></div>
               
               <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                     <div className={`w-10 h-10 rounded-lg ${project.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center text-gray-800 dark:text-white font-bold`}>
                        {project.name.charAt(0)}
                     </div>
                     <div className="flex gap-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
                           {project.status}
                        </span>
                        <div className="dropdown relative group/menu">
                          <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded">
                             <MoreVertical size={16} />
                          </button>
                          <div className="hidden group-hover/menu:block absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10 py-1">
                             <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                               <Edit size={14} /> {t.edit}
                             </button>
                             <button 
                               onClick={() => handleDelete(project.id)}
                               className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2"
                             >
                               <Trash2 size={14} /> {t.delete}
                             </button>
                          </div>
                        </div>
                     </div>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 group-hover:text-nebula-600 dark:group-hover:text-nebula-400 transition-colors">{project.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">{project.desc}</p>
                  
                  {/* Mock Members */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                     <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                           <div key={i} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] text-gray-500">
                             U{i}
                           </div>
                        ))}
                     </div>
                     <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} /> {project.lastEdited}
                     </div>
                  </div>
               </div>
               
               {/* Quick Action Footer */}
               <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center group-hover:bg-nebula-50 dark:group-hover:bg-nebula-900/10 transition-colors">
                  <button className="text-xs font-medium text-gray-500 hover:text-nebula-600 flex items-center gap-1">
                     <Github size={14} /> GitHub
                  </button>
                  <button className="text-xs font-medium text-nebula-600 hover:text-nebula-700 flex items-center gap-1">
                     Open App <ArrowRightIcon />
                  </button>
               </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                 <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t.projectName}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t.status}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">{t.members}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">{t.lastEdited}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">{t.actions}</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                 {filteredProjects.map(project => (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-lg ${project.color} flex items-center justify-center text-white font-bold text-xs`}>
                                {project.name.charAt(0)}
                             </div>
                             <div>
                                <p className="font-medium text-gray-800 dark:text-white group-hover:text-nebula-600 transition-colors">{project.name}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{project.desc}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
                             {project.status}
                          </span>
                       </td>
                       <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex -space-x-2">
                             {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-gray-800"></div>
                             ))}
                          </div>
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                          {project.lastEdited}
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="p-1.5 text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 bg-gray-100 dark:bg-gray-700 rounded-md transition-colors" title={t.edit}>
                                <Edit size={14} />
                             </button>
                             <button className="p-1.5 text-gray-400 hover:text-gray-800 dark:hover:text-white bg-gray-100 dark:bg-gray-700 rounded-md transition-colors" title={t.pushToGithub}>
                                <Github size={14} />
                             </button>
                             <button 
                               onClick={() => handleDelete(project.id)}
                               className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-100 dark:bg-gray-700 rounded-md transition-colors" 
                               title={t.delete}
                             >
                                <Trash2 size={14} />
                             </button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

// Helper component just for icon
const ArrowRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default ProjectList;