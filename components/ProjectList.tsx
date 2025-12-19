import React, { useState, useRef } from 'react';
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
  AlertCircle,
  // Wizard Icons
  Loader2,
  Check,
  ArrowLeft,
  ChevronRight,
  Rocket,
  Database,
  Server,
  HardDrive,
  PlayCircle,
  ChevronDown,
  Users,
  Save,
  X,
  Copy,
  Hash,
  AlertTriangle,
  Radiation,
  Monitor,
  Settings,
  Skull,
  Upload,
  Download,
  Key,
  LayoutTemplate
} from 'lucide-react';
import { MOCK_PROJECTS, LOCALE, MOCK_TEMPLATES } from '../constants';
import { Language } from '../types';
import { createProject, getProjectMembers, updateProject, copyProject, createTemplate, getProjectDeleteInfo, deleteProject } from '../services/mockService';

interface ProjectListProps {
  lang: Language;
}

const ProjectList: React.FC<ProjectListProps> = ({ lang }) => {
  const t = LOCALE[lang];
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Wizard State (Create)
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    name: '',
    projectNumber: '',
    desc: '',
    templateId: 'blank',
    dbType: 'mysql',
    dbHost: 'localhost',
    dbPort: '3306',
    dbName: '',
    dbUser: '',
    dbPassword: '',
    dbTestConnection: false
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [availableMembers, setAvailableMembers] = useState<any[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  // Copy Modal State
  const [copyDialog, setCopyDialog] = useState<{isOpen: boolean, project: any | null}>({
    isOpen: false, 
    project: null
  });
  const [isCopying, setIsCopying] = useState(false);

  // Key Dialog State
  const [keyDialog, setKeyDialog] = useState<{isOpen: boolean, project: any | null, key: string}>({
    isOpen: false, 
    project: null,
    key: ''
  });
  const [isKeyCopied, setIsKeyCopied] = useState(false);

  // Publish Template Dialog State
  const [publishDialog, setPublishDialog] = useState<{isOpen: boolean, project: any | null}>({
    isOpen: false, 
    project: null
  });
  const [isPublishing, setIsPublishing] = useState(false);

  // Delete Wizard State
  const [deleteWizardOpen, setDeleteWizardOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [isLoadingDeleteInfo, setIsLoadingDeleteInfo] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState<any>(null);
  
  // Delete Selection State (Step 2)
  const [deleteSelection, setDeleteSelection] = useState({
    frontend: true,
    backend: true,
    database: true,
    config: true,
    backups: false,
    logs: false
  });
  
  // Delete Confirmation Checkbox (Step 3)
  const [deleteFinalCheckbox, setDeleteFinalCheckbox] = useState(false);

  // Stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.status === 'Closed').length;

  // Filter Logic
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.number && p.number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteClick = async (project: any) => {
    setProjectToDelete(project);
    setDeleteStep(1);
    setDeleteConfirmName('');
    setDeleteProgress(0);
    setDeleteFinalCheckbox(false);
    // Reset selection defaults
    setDeleteSelection({
      frontend: true,
      backend: true,
      database: true,
      config: true,
      backups: false,
      logs: false
    });
    setDeleteWizardOpen(true);
    
    // Fetch delete info from backend
    setIsLoadingDeleteInfo(true);
    try {
        const info = await getProjectDeleteInfo(project.id);
        setDeleteInfo(info);
    } catch (error) {
        console.error("Failed to fetch delete info", error);
        setDeleteInfo(null);
    } finally {
        setIsLoadingDeleteInfo(false);
    }
  };

  const executeDelete = async () => {
     if (!projectToDelete) return;
     
     setIsDeleting(true);
     setDeleteStep(4);
     
     // Simulate deletion progress
     const interval = setInterval(() => {
        setDeleteProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                return 100;
            }
            return prev + 10;
        });
     }, 200);

     try {
         // Call backend interface with all collected parameters
         await deleteProject(projectToDelete.id, {
             deleteComponents: deleteSelection,
             confirmProjectName: deleteConfirmName,
             timestamp: new Date().toISOString()
         });
         
         setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
     } catch (error) {
         console.error("Failed to delete project", error);
         alert("Failed to delete project");
     } finally {
         clearInterval(interval);
         setIsDeleting(false);
         setDeleteWizardOpen(false);
         setProjectToDelete(null);
     }
  };

  const handleCopyClick = (project: any, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent interfering with other click handlers
    setCopyDialog({ isOpen: true, project });
  };

  const executeCopy = async () => {
    if (!copyDialog.project) return;
    
    setIsCopying(true);
    try {
        await copyProject(copyDialog.project.id);
        // Simulate adding the copied project to the list
        const copiedProject = {
            ...copyDialog.project,
            id: projects.length + 100 + Date.now(),
            name: `${copyDialog.project.name} - Copy`,
            number: `${copyDialog.project.number}-CP`,
            lastEdited: 'Just now',
            status: 'In Progress' // Reset status for copy
        };
        setProjects([copiedProject, ...projects]);
        setCopyDialog({ isOpen: false, project: null });
    } catch (error) {
        console.error("Failed to copy project", error);
        alert("Failed to copy project");
    } finally {
        setIsCopying(false);
    }
  };

  const handleViewKey = (project: any) => {
      // Mock key generation based on project ID
      const mockKey = `nk_live_${project.id}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      setKeyDialog({
          isOpen: true,
          project: project,
          key: mockKey
      });
      setIsKeyCopied(false);
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(keyDialog.key);
      setIsKeyCopied(true);
      setTimeout(() => setIsKeyCopied(false), 2000);
  };

  const handlePublishClick = (project: any) => {
      setPublishDialog({ isOpen: true, project });
  };

  const executePublish = async () => {
      if (!publishDialog.project) return;
      setIsPublishing(true);
      try {
          // Map project to template structure
          await createTemplate({
              name: publishDialog.project.name,
              desc: publishDialog.project.desc,
              category: 'catGeneral', // Default category
              tags: ['Project', 'Custom'],
              type: 'custom'
          });
          alert(t.publishSuccess);
          setPublishDialog({ isOpen: false, project: null });
      } catch (err) {
          console.error(err);
          alert('Failed to publish template');
      } finally {
          setIsPublishing(false);
      }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-nebula-100 text-nebula-700 dark:bg-nebula-900/30 dark:text-nebula-400';
      case 'Closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // --- Import / Export Handlers ---
  const handleExport = (project: any) => {
    const dataStr = JSON.stringify(project, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    
    const date = new Date().toISOString().split('T')[0];
    const safeName = (project.number || project.name || 'project').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `nebula-${safeName}-${date}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Handle both single object and array import
        const itemsToImport = Array.isArray(json) ? json : [json];
        
        const validProjects = itemsToImport.filter(p => p.name);
        
        if (validProjects.length > 0) {
             // Regenerate IDs to avoid conflicts and prepend
             const importedProjects = validProjects.map((p, index) => ({
                 ...p,
                 id: Date.now() + index + Math.floor(Math.random() * 1000),
                 name: `${p.name} (Imported)`
             }));
             setProjects([...importedProjects, ...projects]);
             alert(`Successfully imported ${importedProjects.length} project(s).`);
        } else {
             alert('Invalid file format: No valid project data found.');
        }
      } catch (err) {
        console.error('Import failed', err);
        alert('Failed to parse JSON file.');
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // --- Create Wizard Functions ---
  const openWizard = () => {
    setWizardStep(1);
    setWizardData({
      name: '',
      projectNumber: '',
      desc: '',
      templateId: 'blank',
      dbType: 'mysql',
      dbHost: 'localhost',
      dbPort: '3306',
      dbName: '',
      dbUser: '',
      dbPassword: '',
      dbTestConnection: false
    });
    setIsWizardOpen(true);
  };

  const closeWizard = () => {
    if (isCreating) return;
    setIsWizardOpen(false);
  };

  const handleCreateProject = async () => {
    if (!wizardData.name.trim()) {
      alert(t.namePlaceholder);
      setWizardStep(1);
      return;
    }
    if (!wizardData.projectNumber.trim()) {
      alert(t.projectNumberPlaceholder);
      setWizardStep(1);
      return;
    }

    setIsCreating(true);

    try {
      await createProject(wizardData);
      
      const newProject = {
        id: projects.length + 100 + Date.now(),
        name: wizardData.name,
        number: wizardData.projectNumber,
        desc: wizardData.desc || 'No description',
        status: 'In Progress',
        lastEdited: 'Just now',
        color: 'bg-nebula-500',
        size: '0 MB',
        created: new Date().toISOString().split('T')[0]
      };
      
      setProjects([newProject, ...projects]);
      setIsWizardOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  // --- Edit Modal Functions ---
  const handleEditClick = async (project: any) => {
    setEditingProject({ ...project });
    // Randomly select some members for demo
    setSelectedMemberIds([101, 102]); 
    setIsEditModalOpen(true);
    setLoadingMembers(true);
    try {
        const members = await getProjectMembers();
        setAvailableMembers(members);
    } catch (err) {
        console.error("Failed to fetch members", err);
    } finally {
        setLoadingMembers(false);
    }
  };

  const closeEditModal = () => {
    if (isSaving) return;
    setIsEditModalOpen(false);
    setEditingProject(null);
  };

  const toggleMemberSelection = (id: number) => {
     setSelectedMemberIds(prev => 
        prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
     );
  };

  const handleUpdateProject = async () => {
      if (!editingProject) return;
      if (!editingProject.name.trim()) {
          alert(t.namePlaceholder);
          return;
      }
      if (!editingProject.number?.trim()) {
          alert(t.projectNumberPlaceholder);
          return;
      }
      
      setIsSaving(true);
      try {
          await updateProject(editingProject.id, {
              ...editingProject,
              memberIds: selectedMemberIds
          });
          
          setProjects(prev => prev.map(p => 
              p.id === editingProject.id ? { ...editingProject, lastEdited: 'Just now' } : p
          ));
          
          setIsEditModalOpen(false);
      } catch (err) {
          console.error("Update failed", err);
          alert("Failed to update project");
      } finally {
          setIsSaving(false);
      }
  };

  const dbTypes = [
    { id: 'mysql', label: 'MySQL', icon: Database, defaultPort: '3306' },
    { id: 'postgresql', label: 'PostgreSQL', icon: Server, defaultPort: '5432' },
    { id: 'oracle', label: 'Oracle', icon: PlayCircle, defaultPort: '1521' },
    { id: 'dameng', label: 'Dameng', icon: HardDrive, defaultPort: '5236' },
    { id: 'kingbase', label: 'Kingbase', icon: Check, defaultPort: '54321' },
  ];

  const handleDbTypeSelect = (typeId: string, defaultPort: string) => {
    setWizardData(prev => ({
      ...prev,
      dbType: typeId,
      dbPort: defaultPort
    }));
  };

  // --- Step 2 Logic ---
  const toggleSelectAll = () => {
    const allSelected = deleteSelection.frontend && deleteSelection.backend && deleteSelection.database && deleteSelection.config;
    const newState = !allSelected;
    setDeleteSelection(prev => ({
        ...prev,
        frontend: newState,
        backend: newState,
        database: newState,
        config: newState
    }));
  };

  const selectedComponentsCount = [deleteSelection.frontend, deleteSelection.backend, deleteSelection.database, deleteSelection.config].filter(Boolean).length;

  // Render Wizard Step Content
  const renderWizardContent = () => {
    switch(wizardStep) {
      case 1: // Basic Info
        return (
          <div className="space-y-6 animate-fade-in px-2">
             <div className="mb-4">
               <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.step1}</h3>
               <p className="text-gray-500 dark:text-gray-400 text-sm">请输入项目的基本信息，这些信息将用于识别和管理您的项目。</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.projectName} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={wizardData.name}
                    onChange={(e) => setWizardData({...wizardData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white"
                    placeholder={t.namePlaceholder}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.projectNumber} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={wizardData.projectNumber}
                    onChange={(e) => setWizardData({...wizardData, projectNumber: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white"
                    placeholder={t.projectNumberPlaceholder}
                  />
                </div>
             </div>
             
             <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.projectDesc}</label>
               <textarea 
                 value={wizardData.desc}
                 onChange={(e) => setWizardData({...wizardData, desc: e.target.value})}
                 className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white h-32 resize-none"
                 placeholder={t.descPlaceholder}
               />
             </div>
          </div>
        );
      case 2: // Template Selection
        return (
          <div className="space-y-8 animate-fade-in px-2 py-4">
             <div className="text-left md:text-left mb-6">
               <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">{t.selectTemplateTitle}</h3>
               <p className="text-gray-500 dark:text-gray-400">{t.selectTemplateDesc}</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_TEMPLATES.map(tpl => (
                  <div 
                    key={tpl.id}
                    onClick={() => setWizardData({...wizardData, templateId: tpl.id})}
                    className={`relative p-8 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center text-center group h-full ${
                      wizardData.templateId === tpl.id 
                        ? 'border-nebula-500 bg-nebula-50/50 dark:bg-nebula-900/20 shadow-md ring-1 ring-nebula-500' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-nebula-400 dark:hover:border-nebula-500 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center transition-colors ${
                       wizardData.templateId === tpl.id 
                       ? 'bg-nebula-600 text-white' 
                       : 'bg-blue-50 dark:bg-gray-700 text-nebula-600 dark:text-nebula-400 group-hover:bg-nebula-600 group-hover:text-white'
                    }`}>
                      <tpl.icon size={32} />
                    </div>
                    <h4 className={`font-bold text-lg mb-3 ${
                        wizardData.templateId === tpl.id ? 'text-nebula-700 dark:text-nebula-300' : 'text-gray-800 dark:text-white'
                    }`}>
                      {t[tpl.nameKey as keyof typeof t]}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                      {t[tpl.descKey as keyof typeof t]}
                    </p>
                    {wizardData.templateId === tpl.id && (
                        <div className="absolute top-4 right-4 text-nebula-600 dark:text-nebula-400">
                            <Check size={20} className="bg-white dark:bg-gray-800 rounded-full p-0.5" />
                        </div>
                    )}
                  </div>
                ))}
             </div>
          </div>
        );
      case 3: // Database Config
        return (
          <div className="space-y-8 animate-fade-in px-2 py-4">
             <div className="mb-4">
               <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.dbConfigTitle}</h3>
               <p className="text-gray-500 dark:text-gray-400 text-sm">{t.dbConfigDesc}</p>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               {dbTypes.map((type) => (
                 <div 
                   key={type.id}
                   onClick={() => handleDbTypeSelect(type.id, type.defaultPort)}
                   className={`
                     cursor-pointer rounded-xl border-2 p-2 flex flex-col items-center justify-center gap-2 transition-all h-24
                     ${wizardData.dbType === type.id 
                       ? 'border-nebula-500 bg-nebula-50 dark:bg-nebula-900/20 text-nebula-700 dark:text-nebula-300' 
                       : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-nebula-300'}
                   `}
                 >
                   <type.icon size={24} className={wizardData.dbType === type.id ? 'text-nebula-600' : 'text-gray-400'} />
                   <span className="font-bold text-xs">{type.label}</span>
                 </div>
               ))}
             </div>
             <div className="space-y-4">
               <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.dbHost} <span className="text-red-500">*</span></label><input type="text" value={wizardData.dbHost} onChange={(e) => setWizardData({...wizardData, dbHost: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white"/></div>
               <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.dbPort} <span className="text-red-500">*</span></label><input type="text" value={wizardData.dbPort} onChange={(e) => setWizardData({...wizardData, dbPort: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white"/></div>
               <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.dbName} <span className="text-red-500">*</span></label><input type="text" value={wizardData.dbName} onChange={(e) => setWizardData({...wizardData, dbName: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white" placeholder={t.dbNamePlaceholder}/></div>
               <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.dbUser} <span className="text-red-500">*</span></label><input type="text" value={wizardData.dbUser} onChange={(e) => setWizardData({...wizardData, dbUser: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white" placeholder={t.dbUserPlaceholder}/></div>
               <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.dbPassword} <span className="text-red-500">*</span></label><input type="password" value={wizardData.dbPassword} onChange={(e) => setWizardData({...wizardData, dbPassword: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white" placeholder={t.dbPasswordPlaceholder}/></div>
               <div className="pt-2"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={wizardData.dbTestConnection} onChange={(e) => setWizardData({...wizardData, dbTestConnection: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-nebula-600 focus:ring-nebula-500"/><span className="text-sm text-gray-700 dark:text-gray-300">{t.dbTestConnection}</span></label></div>
             </div>
          </div>
        );
      case 4: // Confirmation
        const selectedTpl = MOCK_TEMPLATES.find(t => t.id === wizardData.templateId);
        return (
          <div className="space-y-6 animate-fade-in px-2">
             <div className="mb-4">
               <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.step4}</h3>
               <p className="text-gray-500 dark:text-gray-400 text-sm">请核对以下信息，确认无误后点击创建。</p>
             </div>
             <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3"><span className="text-gray-500 dark:text-gray-400">{t.projectName}</span><span className="font-medium text-gray-800 dark:text-white">{wizardData.name}</span></div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3"><span className="text-gray-500 dark:text-gray-400">{t.projectNumber}</span><span className="font-medium text-gray-800 dark:text-white">{wizardData.projectNumber}</span></div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3"><span className="text-gray-500 dark:text-gray-400">{t.selectTemplate}</span><span className="font-medium text-gray-800 dark:text-white flex items-center gap-1">{selectedTpl && <selectedTpl.icon size={14} />}{selectedTpl ? t[selectedTpl.nameKey as keyof typeof t] : '-'}</span></div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3"><span className="text-gray-500 dark:text-gray-400">{t.dbType}</span><span className="font-medium text-gray-800 dark:text-white uppercase">{wizardData.dbType}</span></div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3"><span className="text-gray-500 dark:text-gray-400">{t.dbHost}</span><span className="font-medium text-gray-800 dark:text-white">{wizardData.dbHost}:{wizardData.dbPort}</span></div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3"><span className="text-gray-500 dark:text-gray-400">{t.dbName}</span><span className="font-medium text-gray-800 dark:text-white">{wizardData.dbName || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t.dbUser}</span><span className="font-medium text-gray-800 dark:text-white">{wizardData.dbUser || '-'}</span></div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderDeleteWizardContent = () => {
      // Loading state
      if (isLoadingDeleteInfo) {
          return (
              <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                  <Loader2 className="animate-spin text-nebula-500 mb-4" size={40} />
                  <p className="text-gray-500 dark:text-gray-400">{t.loading}</p>
              </div>
          );
      }

      // Ensure data exists before rendering steps (fallback if error)
      const info = deleteInfo || { 
          name: projectToDelete.name, 
          number: projectToDelete.number, 
          size: projectToDelete.size || 'Unknown',
          stats: { frontend: {}, backend: {}, database: {}, config: {} },
          backups: {}, logs: {}
      };

      switch(deleteStep) {
          case 1:
              return (
                  <div className="space-y-6 animate-fade-in">
                      {/* Warning Banner */}
                      <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
                          <div className="flex items-start gap-3">
                              <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" />
                              <div>
                                  <h4 className="font-bold text-amber-800 dark:text-amber-200 text-sm mb-1">{t.warningTitle}</h4>
                                  <p className="text-sm text-amber-700 dark:text-amber-300">{t.warningDesc}</p>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-3">
                          <h3 className="font-bold text-gray-800 dark:text-white text-lg">{t.confirmDelProject}</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{t.confirmDelDesc}</p>
                      </div>

                      {/* Project Detail Card */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                <div className="space-y-1">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium block">{t.projectName}</span>
                                    <span className="text-base text-gray-800 dark:text-white font-medium">{projectToDelete.name}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium block">{t.projectID}</span>
                                    <span className="text-base text-gray-800 dark:text-white font-mono">{projectToDelete.number}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium block">{t.createTime}</span>
                                    <span className="text-base text-gray-800 dark:text-white">{projectToDelete.created || '2023-01-01'}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium block">{t.lastModified}</span>
                                    <span className="text-base text-gray-800 dark:text-white">{projectToDelete.lastEdited}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium block">{t.status}</span>
                                    <span className="text-base text-emerald-600 dark:text-emerald-400 font-medium">{t.statusInProgress}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium block">{t.projectSize}</span>
                                    <span className="text-base text-gray-800 dark:text-white">{info.size}</span>
                                </div>
                          </div>
                      </div>

                      {/* Red Impact Warning */}
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3 text-red-700 dark:text-red-300 font-bold text-sm">
                              <Radiation size={16} />
                              {t.associatedResources}
                          </div>
                          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1 pl-1">
                              <li>{t.resFrontend}</li>
                              <li>{t.resBackend}</li>
                              <li>{t.resDb}</li>
                              <li>{t.resLogs}</li>
                              <li>{t.resPerms}</li>
                          </ul>
                      </div>
                  </div>
              );
          case 2:
              const componentList = [
                  { 
                      id: 'frontend', 
                      icon: Monitor, 
                      colorClass: {
                          bg: 'bg-blue-50 dark:bg-blue-900/30',
                          text: 'text-blue-600 dark:text-blue-400',
                          borderHover: 'hover:border-blue-300 dark:hover:border-blue-700'
                      },
                      title: t.compFrontend, 
                      desc: t.compFrontendDesc,
                      stats: [
                          { value: info.stats.frontend?.pages || 0, label: t.statPages },
                          { value: info.stats.frontend?.components || 0, label: t.statComponents }
                      ]
                  },
                  { 
                      id: 'backend', 
                      icon: Server, 
                      colorClass: {
                          bg: 'bg-cyan-50 dark:bg-cyan-900/30',
                          text: 'text-cyan-600 dark:text-cyan-400',
                          borderHover: 'hover:border-cyan-300 dark:hover:border-cyan-700'
                      },
                      title: t.compBackend, 
                      desc: t.compBackendDesc,
                      stats: [
                          { value: info.stats.backend?.apis || 0, label: t.statApis },
                          { value: info.stats.backend?.services || 0, label: t.statServices }
                      ]
                  },
                  { 
                      id: 'database', 
                      icon: Database, 
                      colorClass: {
                          bg: 'bg-amber-50 dark:bg-amber-900/30',
                          text: 'text-amber-600 dark:text-amber-400',
                          borderHover: 'hover:border-amber-300 dark:hover:border-amber-700'
                      },
                      title: t.compDB, 
                      desc: t.compDBDesc,
                      stats: [
                          { value: info.stats.database?.tables || 0, label: t.statTables },
                          { value: info.stats.database?.records || 0, label: t.statRecords }
                      ]
                  },
                  { 
                      id: 'config', 
                      icon: Settings, 
                      colorClass: {
                          bg: 'bg-purple-50 dark:bg-purple-900/30',
                          text: 'text-purple-600 dark:text-purple-400',
                          borderHover: 'hover:border-purple-300 dark:hover:border-purple-700'
                      },
                      title: t.compConfig, 
                      desc: t.compConfigDesc,
                      stats: [
                          { value: info.stats.config?.envs || 0, label: t.statEnvs },
                          { value: info.stats.config?.files || 0, label: t.statFiles }
                      ]
                  }
              ];

              return (
                  <div className="space-y-6 animate-fade-in">
                       {/* Header */}
                       <div className="mb-4">
                           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.delSelectComponentsTitle}</h3>
                           <p className="text-gray-500 dark:text-gray-400 text-sm">{t.delSelectComponentsDesc}</p>
                       </div>

                       {/* Select All Bar */}
                       <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
                           <label className="flex items-center gap-3 cursor-pointer">
                               <input 
                                 type="checkbox" 
                                 checked={selectedComponentsCount === 4}
                                 onChange={toggleSelectAll}
                                 className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors" 
                               />
                               <span className="font-bold text-gray-800 dark:text-white">{t.selectAllComponents}</span>
                           </label>
                           <span className="text-sm text-gray-500 dark:text-gray-400">
                               {t.selectedComponentsCount.replace('{count}', selectedComponentsCount.toString())}
                           </span>
                       </div>

                       {/* Components List - Refactored to map */}
                       <div className="space-y-3">
                           {componentList.map((comp) => (
                               <div key={comp.id} className={`p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-between group ${comp.colorClass.borderHover} transition-all`}>
                                   <div className="flex items-center gap-4">
                                       <div className={`w-12 h-12 rounded-lg ${comp.colorClass.bg} ${comp.colorClass.text} flex items-center justify-center`}>
                                           <comp.icon size={24} />
                                       </div>
                                       <div>
                                           <h4 className="font-bold text-gray-800 dark:text-white">{comp.title}</h4>
                                           <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{comp.desc}</p>
                                       </div>
                                   </div>
                                   <div className="flex items-center gap-8">
                                       {comp.stats.map((stat, idx) => (
                                           <div key={idx} className="text-right hidden sm:block">
                                               <div className="text-lg font-bold text-gray-800 dark:text-white">{stat.value}</div>
                                               <div className="text-xs text-gray-400">{stat.label}</div>
                                           </div>
                                       ))}
                                       <label className="relative flex items-center justify-center w-6 h-6 cursor-pointer">
                                           <input 
                                             type="checkbox" 
                                             checked={deleteSelection[comp.id as keyof typeof deleteSelection] as boolean} 
                                             onChange={(e) => setDeleteSelection({...deleteSelection, [comp.id]: e.target.checked})}
                                             className={`peer appearance-none w-6 h-6 border-2 border-gray-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 transition-all`}
                                           />
                                           <Check size={16} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                       </label>
                                   </div>
                               </div>
                           ))}
                       </div>

                       {/* Danger Zone */}
                       <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-xl p-5 mt-6">
                           <div className="flex items-center gap-2 mb-4 text-red-600 font-bold">
                               <Skull size={20} />
                               <span>{t.dangerZone}</span>
                           </div>
                           
                           <div className="space-y-3">
                               <label className="flex items-start gap-3 cursor-pointer group">
                                   <input 
                                     type="checkbox" 
                                     checked={deleteSelection.backups}
                                     onChange={(e) => setDeleteSelection({...deleteSelection, backups: e.target.checked})}
                                     className="w-5 h-5 mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500 transition-colors" 
                                   />
                                   <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                                       {t.deleteBackups} ({info.backups?.count || 0} backups, {info.backups?.size || '0 MB'})
                                   </span>
                               </label>
                               <label className="flex items-start gap-3 cursor-pointer group">
                                   <input 
                                     type="checkbox" 
                                     checked={deleteSelection.logs}
                                     onChange={(e) => setDeleteSelection({...deleteSelection, logs: e.target.checked})}
                                     className="w-5 h-5 mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500 transition-colors" 
                                   />
                                   <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                                       {t.deleteLogs} ({info.logs?.count || 0} entries)
                                   </span>
                               </label>
                           </div>

                           <div className="flex items-center gap-2 mt-4 text-xs text-red-500 font-medium">
                               <AlertCircle size={14} />
                               {t.dangerActionWarning}
                           </div>
                       </div>
                  </div>
              );
          case 3:
              const SummaryRow = ({ label, value, isDelete, details }: any) => (
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{label}</span>
                      <div className="flex items-center gap-2">
                          <span className={`font-bold ${isDelete ? 'text-red-500' : 'text-emerald-500'}`}>
                              {isDelete ? t.delStatusDelete : t.delStatusKeep}
                          </span>
                          {isDelete && details && (
                              <span className="text-red-400 text-xs hidden sm:inline">{details}</span>
                          )}
                          {!isDelete && !details && (
                              <span className="font-medium text-gray-800 dark:text-white">{value}</span>
                          )}
                      </div>
                  </div>
              );

              return (
                  <div className="space-y-6 animate-fade-in">
                      {/* Header */}
                      <div className="mb-4">
                           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.delFinalConfirmTitle}</h3>
                           <p className="text-gray-500 dark:text-gray-400 text-sm">{t.delFinalConfirmSubtitle}</p>
                       </div>

                      {/* Deletion Summary Box */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                          <h4 className="font-bold text-gray-800 dark:text-white mb-4">{t.delSummaryTitle}</h4>
                          <div className="space-y-1">
                              {/* Project Name */}
                              <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-700 text-sm">
                                  <span className="text-gray-600 dark:text-gray-400 font-medium">{t.delSummaryProjectName}:</span>
                                  <span className="font-bold text-gray-800 dark:text-white">{projectToDelete.name}</span>
                              </div>
                              
                              {/* Components */}
                              <SummaryRow label={t.delSummaryFrontend} isDelete={deleteSelection.frontend} details={`(${info.stats.frontend?.pages} pages, ${info.stats.frontend?.components} components)`} />
                              <SummaryRow label={t.delSummaryBackend} isDelete={deleteSelection.backend} details={`(${info.stats.backend?.apis} APIs)`} />
                              <SummaryRow label={t.delSummaryDatabase} isDelete={deleteSelection.database} details={`(${info.stats.database?.tables} tables)`} />
                              <SummaryRow label={t.delSummaryConfig} isDelete={deleteSelection.config} details={`(${info.stats.config?.files} files)`} />
                              
                              {/* Extra Options */}
                              <SummaryRow label={t.delSummaryBackups} isDelete={deleteSelection.backups} />
                              <SummaryRow label={t.delSummaryLogs} isDelete={deleteSelection.logs} />

                              {/* Space Freed */}
                              <div className="flex justify-between items-center py-2.5 border-t border-gray-200 dark:border-gray-600 mt-2 pt-4 text-sm">
                                  <span className="text-gray-600 dark:text-gray-400 font-medium">{t.delSummarySpace}</span>
                                  <span className="font-bold text-gray-800 dark:text-white">{info.size}</span>
                              </div>
                          </div>
                      </div>

                      {/* Final Warning Card */}
                      <div className="border-2 border-red-400 bg-red-50 dark:bg-red-900/10 rounded-xl p-6">
                           <div className="flex items-center gap-2 mb-4 text-red-600 font-bold text-lg">
                               <AlertTriangle size={24} className="fill-red-100" />
                               <span>{t.delFinalWarningTitle}</span>
                           </div>
                           
                           <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                               {t.delFinalWarningDesc.replace('{name}', '')} 
                               <span className="font-bold bg-red-100 dark:bg-red-900/40 px-1 rounded mx-1">{projectToDelete.name}</span> 
                               {lang === 'zh' ? '以继续。' : 'to continue.'}
                           </p>

                           <div className="mb-4">
                               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.delInputLabel}</label>
                               <input 
                                  type="text" 
                                  value={deleteConfirmName}
                                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all dark:bg-gray-800 dark:text-white"
                                  placeholder={t.delInputPlaceholder}
                               />
                           </div>

                           <label className="flex items-start gap-3 cursor-pointer select-none">
                               <input 
                                 type="checkbox" 
                                 checked={deleteFinalCheckbox}
                                 onChange={(e) => setDeleteFinalCheckbox(e.target.checked)}
                                 className="w-5 h-5 mt-0.5 rounded border-gray-400 text-red-600 focus:ring-red-500 bg-white" 
                               />
                               <span className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">
                                   {t.delCheckboxLabel}
                               </span>
                           </label>
                      </div>
                  </div>
              );
          case 4:
               return (
                   <div className="space-y-8 animate-fade-in py-8">
                       <div className="text-center">
                           <div className="relative w-24 h-24 mx-auto mb-6">
                               <svg className="w-full h-full" viewBox="0 0 100 100">
                                   <circle className="text-gray-200 dark:text-gray-700 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                                   <circle className="text-red-500 progress-ring__circle stroke-current transition-all duration-300 ease-out" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * deleteProgress) / 100} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}></circle>
                               </svg>
                               <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-red-600">
                                   {deleteProgress}%
                               </div>
                           </div>
                           <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t.deleting}</h3>
                           <p className="text-gray-500 dark:text-gray-400">Cleaning up resources...</p>
                       </div>
                   </div>
               );
          default:
              return null;
      }
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
           <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center min-w-[100px]">
              <span className="text-2xl font-bold text-gray-500 dark:text-gray-400">{completedProjects}</span>
              <span className="text-xs text-gray-500 uppercase">{t.completedProjects}</span>
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
           
           {/* Custom Select with fixed chevron position */}
           <div className="relative">
             <select 
               value={statusFilter} 
               onChange={(e) => setStatusFilter(e.target.value)}
               className="appearance-none pl-4 pr-10 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-nebula-500 h-full min-w-[140px]"
             >
               <option value="All">{t.filterAll}</option>
               <option value="In Progress">{t.statusInProgress}</option>
               <option value="Closed">{t.statusClosed}</option>
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
           </div>
        </div>

        {/* Actions & View Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto">
           {/* Import Button */}
           <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mr-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json"
                onChange={handleFileChange}
              />
              <button 
                onClick={handleImportClick}
                className="p-2 rounded-md transition-all text-gray-500 dark:text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 hover:bg-white dark:hover:bg-gray-600"
                title={t.importProject}
              >
                <Upload size={18} />
              </button>
           </div>

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
             onClick={openWizard}
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
                           {project.status === 'In Progress' ? t.statusInProgress : t.statusClosed}
                        </span>
                        <div className="dropdown relative group/menu">
                          <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded">
                             <MoreVertical size={16} />
                          </button>
                          
                          {/* Dropdown Menu with transparent bridge */}
                          <div className="hidden group-hover/menu:block absolute right-0 top-full pt-1 w-32 z-20">
                             <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1">
                               <button 
                                 onClick={() => handleEditClick(project)}
                                 className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                               >
                                 <Edit size={14} /> {t.edit}
                               </button>
                               <button 
                                 onClick={(e) => handleCopyClick(project, e)}
                                 className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                               >
                                 <Copy size={14} /> {t.copy}
                               </button>
                               <button 
                                 onClick={() => handleViewKey(project)}
                                 className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                               >
                                 <Key size={14} /> {t.viewKey}
                               </button>
                               <button 
                                 onClick={() => handlePublishClick(project)}
                                 className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                               >
                                 <LayoutTemplate size={14} /> {t.publishTemplate}
                               </button>
                               <button 
                                 onClick={() => handleExport(project)}
                                 className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                               >
                                 <Download size={14} /> {t.exportProject}
                               </button>
                               <button 
                                 onClick={() => handleDeleteClick(project)}
                                 className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2"
                               >
                                 <Trash2 size={14} /> {t.delete}
                               </button>
                             </div>
                          </div>
                        </div>
                     </div>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1 group-hover:text-nebula-600 dark:group-hover:text-nebula-400 transition-colors">{project.name}</h3>
                  {project.number && <p className="text-xs text-gray-400 mb-2 font-mono">{project.number}</p>}
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
               
               {/* Quick Action Footer - Hide Open App if closed */}
               <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center group-hover:bg-nebula-50 dark:group-hover:bg-nebula-900/10 transition-colors h-[45px]">
                  <button className="text-xs font-medium text-gray-500 hover:text-nebula-600 flex items-center gap-1">
                     <Github size={14} /> GitHub
                  </button>
                  {project.status !== 'Closed' && (
                    <button className="text-xs font-medium text-nebula-600 hover:text-nebula-700 flex items-center gap-1">
                       Open App <ArrowRightIcon />
                    </button>
                  )}
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
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t.projectNumber}</th>
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
                       <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                          {project.number || '-'}
                       </td>
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
                             {project.status === 'In Progress' ? t.statusInProgress : t.statusClosed}
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
                             {project.status !== 'Closed' && (
                                <button 
                                  onClick={() => handleEditClick(project)}
                                  className="p-1.5 text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 bg-gray-100 dark:bg-gray-700 rounded-md transition-colors" 
                                  title={t.edit}
                                >
                                    <Edit size={14} />
                                </button>
                             )}
                             <button className="p-1.5 text-gray-400 hover:text-gray-800 dark:hover:text-white bg-gray-100 dark:bg-gray-700 rounded-md transition-colors" title={t.pushToGithub}>
                                <Github size={14} />
                             </button>
                             <button 
                               onClick={(e) => handleCopyClick(project, e)}
                               className="p-1.5 text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 bg-gray-100 dark:bg-gray-700 rounded-md transition-colors" 
                               title={t.copy}
                             >
                                <Copy size={14} />
                             </button>
                             <button 
                               onClick={() => handleViewKey(project)}
                               className="p-1.5 text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 bg-gray-100 dark:bg-gray-700 rounded-md transition-colors" 
                               title={t.viewKey}
                             >
                                <Key size={14} />
                             </button>
                             <button 
                               onClick={() => handlePublishClick(project)}
                               className="p-1.5 text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 bg-gray-100 dark:bg-gray-700 rounded-md transition-colors" 
                               title={t.publishTemplate}
                             >
                                <LayoutTemplate size={14} />
                             </button>
                             <button 
                               onClick={() => handleExport(project)}
                               className="p-1.5 text-gray-400 hover:text-nebula-600 dark:hover:text-nebula-400 bg-gray-100 dark:bg-gray-700 rounded-md transition-colors" 
                               title={t.exportProject}
                             >
                                <Download size={14} />
                             </button>
                             <button 
                               onClick={() => handleDeleteClick(project)}
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

      {/* Project Creation Wizard Modal */}
      {isWizardOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
           {/* ... Wizard Content ... */}
           {/* Reusing existing wizard UI as is, just wrapped */}
           <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
             
             <div className="bg-gradient-to-r from-purple-600 to-nebula-600 p-8 text-white relative flex-shrink-0">
                <h2 className="text-2xl font-bold mb-2">{t.createProjectTitle}</h2>
                <p className="opacity-80 text-sm">{t.createProjectSubtitle}</p>
             </div>

             <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 relative">
               <div className="max-w-4xl mx-auto px-6 py-6">
                 <div className="flex items-center justify-between relative">
                   <div className="absolute left-0 top-4 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-0"></div>
                   <div 
                     className="absolute left-0 top-4 h-0.5 bg-nebula-600 dark:bg-nebula-400 transition-all duration-300 -z-0"
                     style={{ width: `${((wizardStep - 1) / 3) * 100}%` }}
                   ></div>
                   
                   {[1, 2, 3, 4].map(step => {
                     const isCompleted = step < wizardStep;
                     const isCurrent = step === wizardStep;
                     return (
                        <div 
                           key={step} 
                           onClick={() => !isCreating && step < wizardStep && setWizardStep(step)}
                           className={`relative z-10 flex flex-col items-center gap-2 group ${step < wizardStep && !isCreating ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 
                             ${isCompleted ? 'bg-nebula-600 border-nebula-600 text-white' : isCurrent ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30 scale-110' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'}
                             ${isCompleted && !isCreating ? 'group-hover:bg-nebula-700' : ''}
                           `}>
                             {isCompleted ? <Check size={16} /> : step}
                           </div>
                           <span className={`text-xs font-medium transition-colors ${isCompleted ? 'text-nebula-600 dark:text-nebula-400' : isCurrent ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-gray-400'}`}>
                             {t[`step${step}` as keyof typeof t]}
                           </span>
                        </div>
                     );
                   })}
                 </div>
               </div>
               <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700">
                  <div className="h-full bg-gradient-to-r from-nebula-500 to-purple-600 transition-all duration-500 ease-out" style={{ width: `${(wizardStep / 4) * 100}%` }}></div>
               </div>
             </div>

             <div className="p-8 overflow-y-auto bg-white dark:bg-gray-900 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="max-w-4xl mx-auto">
                   {renderWizardContent()}
                </div>
             </div>

             <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-between items-center flex-shrink-0">
                <div>
                  {wizardStep > 1 && (
                    <button onClick={() => setWizardStep(prev => prev - 1)} disabled={isCreating} className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                      <ArrowLeft size={16} /> {t.prev}
                    </button>
                  )}
                </div>
                <div className="flex gap-4">
                  <button onClick={closeWizard} disabled={isCreating} className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    {t.cancel}
                  </button>
                  {wizardStep < 4 ? (
                    <button onClick={() => setWizardStep(prev => prev + 1)} className="px-8 py-2.5 rounded-lg bg-nebula-600 text-white hover:bg-nebula-700 transition-colors shadow-lg shadow-nebula-600/30 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={(wizardStep === 1 && (!wizardData.name || !wizardData.projectNumber)) || (wizardStep === 3 && (!wizardData.dbHost || !wizardData.dbPort || !wizardData.dbName || !wizardData.dbUser || !wizardData.dbPassword))}>
                      {t.next} <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button onClick={handleCreateProject} disabled={isCreating} className="px-8 py-2.5 rounded-lg bg-nebula-600 text-white hover:bg-nebula-700 transition-colors shadow-lg shadow-nebula-600/30 font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                      {isCreating ? <><Loader2 className="animate-spin" size={18} /> {t.loading}</> : <><Rocket size={18} /> {t.create}</>}
                    </button>
                  )}
                </div>
             </div>
           </div>
         </div>
      )}

      {/* Delete Project Wizard Modal */}
      {deleteWizardOpen && projectToDelete && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
           {/* ... Delete Wizard Content (Reusing existing logic) ... */}
           <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="bg-red-500 p-8 text-white relative flex-shrink-0">
                <h2 className="text-2xl font-bold mb-2">{t.deleteProjectTitle}</h2>
                <p className="opacity-90 text-sm">{t.deleteProjectSubtitle}</p>
             </div>
             <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 relative py-6">
                <div className="max-w-3xl mx-auto px-6 relative">
                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="absolute top-4 left-6 h-0.5 bg-red-500 transition-all duration-300" style={{ width: `calc(${((deleteStep - 1) / 3) * 100}% - 48px)` }}></div>
                    <div className="flex justify-between relative">
                       {[1, 2, 3, 4].map(step => (
                           <div key={step} className="flex flex-col items-center gap-2 z-10">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${step <= deleteStep ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'}`}>
                                  {step < deleteStep ? <Check size={16} /> : step}
                               </div>
                               <span className={`text-xs font-medium ${step <= deleteStep ? 'text-red-500' : 'text-gray-400'}`}>{t[`delStep${step}` as keyof typeof t]}</span>
                           </div>
                       ))}
                    </div>
                </div>
             </div>
             <div className="p-8 overflow-y-auto bg-white dark:bg-gray-900 flex-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                 <div className="max-w-3xl mx-auto">{renderDeleteWizardContent()}</div>
             </div>
             {deleteStep < 4 && !isLoadingDeleteInfo && (
                 <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-between items-center flex-shrink-0">
                    <div>
                       {deleteStep > 1 && <button onClick={() => setDeleteStep(prev => prev - 1)} className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium"><ArrowLeft size={16} /> {t.prev}</button>}
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setDeleteWizardOpen(false)} className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium">{t.cancel}</button>
                       {deleteStep < 3 ? (
                          <button onClick={() => setDeleteStep(prev => prev + 1)} className="px-8 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 font-medium flex items-center gap-2">{t.next} <ChevronRight size={16} /></button>
                       ) : (
                          <button onClick={executeDelete} disabled={deleteConfirmName !== projectToDelete.name || !deleteFinalCheckbox} className="px-8 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 size={16} /> {t.delete}</button>
                       )}
                    </div>
                 </div>
             )}
           </div>
         </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && editingProject && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
           {/* ... Edit Modal Content (Reusing existing logic) ... */}
           <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="bg-gradient-to-r from-purple-600 to-nebula-600 p-6 text-white relative flex-shrink-0 flex justify-between items-center">
                <div><h2 className="text-xl font-bold mb-1">{t.editProjectTitle}</h2><p className="opacity-80 text-sm">{t.editProjectSubtitle}</p></div>
                <button onClick={closeEditModal} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"><X size={20} /></button>
             </div>
             <div className="p-8 overflow-y-auto bg-white dark:bg-gray-900">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.projectName} <span className="text-red-500">*</span></label><input type="text" value={editingProject.name} onChange={(e) => setEditingProject({...editingProject, name: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white" /></div>
                      <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.projectNumber} <span className="text-red-500">*</span></label><input type="text" value={editingProject.number || ''} onChange={(e) => setEditingProject({...editingProject, number: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white" /></div>
                    </div>
                    <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.projectDesc}</label><textarea value={editingProject.desc} onChange={(e) => setEditingProject({...editingProject, desc: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white h-24 resize-none" /></div>
                    <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t.status}</label><div className="relative"><select value={editingProject.status} onChange={(e) => setEditingProject({...editingProject, status: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-nebula-500 outline-none transition-colors text-gray-800 dark:text-white appearance-none"><option value="In Progress">In Progress</option><option value="Closed">Closed</option></select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} /></div></div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between"><span>{t.projectMembers}</span><span className="text-xs font-normal text-nebula-600 dark:text-nebula-400 cursor-pointer hover:underline">{t.manageMembers}</span></label>
                       <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 max-h-[200px] overflow-y-auto">
                          {loadingMembers ? <div className="flex items-center justify-center py-8 text-gray-500"><Loader2 className="animate-spin mr-2" size={16} />{t.loadingMembers}</div> : (
                             <div className="space-y-2">{availableMembers.map(member => (<div key={member.id} onClick={() => toggleMemberSelection(member.id)} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all ${selectedMemberIds.includes(member.id) ? 'bg-nebula-50 dark:bg-nebula-900/20 border-nebula-200 dark:border-nebula-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}><div className="flex items-center gap-3"><img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full bg-gray-200" /><div><p className="text-sm font-bold text-gray-800 dark:text-white">{member.name}</p><p className="text-xs text-gray-500">{member.role}</p></div></div><div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedMemberIds.includes(member.id) ? 'bg-nebula-600 border-nebula-600 text-white' : 'border-gray-300 dark:border-gray-600'}`}>{selectedMemberIds.includes(member.id) && <Check size={12} />}</div></div>))}</div>
                          )}
                       </div>
                    </div>
                </div>
             </div>
             <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-end gap-4 flex-shrink-0">
                  <button onClick={closeEditModal} disabled={isSaving} className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50">{t.cancel}</button>
                  <button onClick={handleUpdateProject} disabled={isSaving} className="px-8 py-2.5 rounded-lg bg-nebula-600 text-white hover:bg-nebula-700 transition-colors shadow-lg shadow-nebula-600/30 font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">{isSaving ? <><Loader2 className="animate-spin" size={18} />{t.saving}</> : <><Save size={18} />{t.saveChanges}</>}</button>
             </div>
           </div>
         </div>
      )}

      {/* Copy Confirmation Modal */}
      {copyDialog.isOpen && copyDialog.project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
             <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 rounded-full bg-nebula-100 dark:bg-nebula-900/30 flex items-center justify-center text-nebula-600 dark:text-nebula-400"><Copy size={24} /></div>
                   <div><h3 className="text-lg font-bold text-gray-800 dark:text-white">{t.createProjectTitle.replace('Create New', 'Copy')}</h3></div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{t.copyConfirm}</p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700"><span className="font-medium text-gray-800 dark:text-white">{copyDialog.project.name}</span></div>
             </div>
             <div className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => setCopyDialog({isOpen: false, project: null})} disabled={isCopying} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors">{t.cancel}</button>
                <button onClick={executeCopy} disabled={isCopying} className="px-4 py-2 rounded-lg bg-nebula-600 text-white hover:bg-nebula-700 font-medium transition-colors flex items-center gap-2 shadow-lg shadow-nebula-600/20">{isCopying ? <Loader2 className="animate-spin" size={16} /> : <Copy size={16} />}{t.copy}</button>
             </div>
          </div>
        </div>
      )}

      {/* Publish Template Confirmation Modal */}
      {publishDialog.isOpen && publishDialog.project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
             <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><LayoutTemplate size={24} /></div>
                   <div><h3 className="text-lg font-bold text-gray-800 dark:text-white">{t.confirmPublish}</h3></div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{t.publishTemplateConfirm}</p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700"><span className="font-medium text-gray-800 dark:text-white">{publishDialog.project.name}</span></div>
             </div>
             <div className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => setPublishDialog({isOpen: false, project: null})} disabled={isPublishing} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors">{t.cancel}</button>
                <button onClick={executePublish} disabled={isPublishing} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/20">{isPublishing ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}{t.confirmPublish}</button>
             </div>
          </div>
        </div>
      )}

      {/* Key Dialog */}
      {keyDialog.isOpen && keyDialog.project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
             <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Key size={24} />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t.projectKey}</h3>
                      <p className="text-sm text-gray-500">{keyDialog.project.name}</p>
                   </div>
                </div>
                
                <div className="relative">
                   <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-sm text-gray-700 dark:text-gray-300 break-all pr-12">
                      {keyDialog.key}
                   </div>
                   <button 
                     onClick={copyToClipboard}
                     className="absolute top-2 right-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-500 transition-colors"
                     title={t.copyKey}
                   >
                      {isKeyCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                   </button>
                </div>
             </div>

             <div className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                <button 
                  onClick={() => setKeyDialog({isOpen: false, project: null, key: ''})}
                  className="px-6 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  {t.close}
                </button>
             </div>
          </div>
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