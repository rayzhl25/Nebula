import React, { useState } from 'react';
import { Copy, Key, LayoutTemplate, Loader2, Check } from 'lucide-react';
import { LOCALE } from '../../constants';
import { Language } from '../../types';
import { copyProject, createTemplate } from '../../services/mockService';

interface CopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  lang: Language;
  onSuccess: (newProject: any) => void;
}

/**
 * 复制项目确认弹窗 (CopyModal)
 */
export const CopyModal: React.FC<CopyModalProps> = ({ isOpen, onClose, project, lang, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const t = LOCALE[lang];

  if (!isOpen || !project) return null;

  const handleCopy = async () => {
      setLoading(true);
      try {
          await copyProject(project.id);
          // 模拟复制后的项目数据
          const copiedProject = {
            ...project,
            id: Date.now(),
            name: `${project.name} - Copy`,
            number: `${project.number}-CP`,
            lastEdited: 'Just now',
            status: 'In Progress' 
          };
          onSuccess(copiedProject);
          onClose();
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-nebula-100 dark:bg-nebula-900/30 flex items-center justify-center text-nebula-600 dark:text-nebula-400"><Copy size={24} /></div>
                    <div><h3 className="text-lg font-bold text-gray-800 dark:text-white">{t.createProjectTitle.replace('Create New', 'Copy')}</h3></div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{t.copyConfirm}</p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700"><span className="font-medium text-gray-800 dark:text-white">{project.name}</span></div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                <button onClick={onClose} disabled={loading} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors">{t.cancel}</button>
                <button onClick={handleCopy} disabled={loading} className="px-4 py-2 rounded-lg bg-nebula-600 text-white hover:bg-nebula-700 font-medium transition-colors flex items-center gap-2 shadow-lg shadow-nebula-600/20">{loading ? <Loader2 className="animate-spin" size={16} /> : <Copy size={16} />}{t.copy}</button>
            </div>
        </div>
    </div>
  );
};

interface KeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
    lang: Language;
    accessKey: string;
}

/**
 * 项目密钥查看弹窗 (KeyModal)
 */
export const KeyModal: React.FC<KeyModalProps> = ({ isOpen, onClose, project, lang, accessKey }) => {
    const t = LOCALE[lang];
    const [copied, setCopied] = useState(false);

    if (!isOpen || !project) return null;

    // 复制密钥到剪贴板
    const copyToClipboard = () => {
        navigator.clipboard.writeText(accessKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
             <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400"><Key size={24} /></div>
                   <div><h3 className="text-lg font-bold text-gray-800 dark:text-white">{t.projectKey}</h3><p className="text-sm text-gray-500">{project.name}</p></div>
                </div>
                <div className="relative">
                   <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-sm text-gray-700 dark:text-gray-300 break-all pr-12">{accessKey}</div>
                   <button onClick={copyToClipboard} className="absolute top-2 right-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-500 transition-colors" title={t.copyKey}>{copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}</button>
                </div>
             </div>
             <div className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors">{t.close}</button>
             </div>
          </div>
        </div>
    );
};

interface PublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
    lang: Language;
}

/**
 * 发布为模板确认弹窗 (PublishModal)
 */
export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, project, lang }) => {
    const t = LOCALE[lang];
    const [loading, setLoading] = useState(false);

    if (!isOpen || !project) return null;

    const handlePublish = async () => {
        setLoading(true);
        try {
            await createTemplate({
                name: project.name,
                desc: project.desc,
                category: 'catGeneral',
                tags: ['Project', 'Custom'],
                type: 'custom'
            });
            alert(t.publishSuccess);
            onClose();
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
             <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><LayoutTemplate size={24} /></div>
                   <div><h3 className="text-lg font-bold text-gray-800 dark:text-white">{t.confirmPublish}</h3></div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{t.publishTemplateConfirm}</p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700"><span className="font-medium text-gray-800 dark:text-white">{project.name}</span></div>
             </div>
             <div className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                <button onClick={onClose} disabled={loading} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors">{t.cancel}</button>
                <button onClick={handlePublish} disabled={loading} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/20">{loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}{t.confirmPublish}</button>
             </div>
          </div>
        </div>
    );
};