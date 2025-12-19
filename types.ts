
export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'zh' | 'en';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'developer' | 'viewer';
}

export interface Tenant {
  id: string;
  name: string;
  logo: string;
}

export interface MenuItem {
  id: string;
  icon: any; // LucideIcon
  labelKey: string;
  children?: MenuItem[];
}

export interface ChartData {
  name: string;
  value: number;
}

export interface Department {
  id: string;
  parentId?: string | null;
  name: string;
  code: string;
  manager: string;
  memberCount: number;
  status: 'Active' | 'Inactive';
  description: string;
  children?: Department[];
}

export interface Developer {
  id: string;
  name: string;
  phone: string;
  position: string;
  role: string;
  departmentId: string;
  gender: 'Male' | 'Female';
  avatar: string;
  birthday: string;
  email: string;
  status: 'Active' | 'Inactive';
  joinDate: string;
  remarks?: string;
}

export interface Permission {
  id: string;
  module: string; // e.g., 'Projects', 'System'
  action: string; // e.g., 'read', 'write'
  labelKey: string; // Translation key
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'Active' | 'Inactive';
  permissionIds: string[];
  userCount: number;
}

export type ResourceType = 
  | 'page_template' 
  | 'biz_component' 
  | 'vue_component' 
  | 'pro_component' 
  | 'function'
  | 'script' 
  | 'service' 
  | 'api' 
  | 'sql';

export interface Resource {
  id: string;
  name: string;
  code: string;
  type: ResourceType;
  group: string; // Grouping category
  appType?: 'Web' | 'App' | 'Backend'; // New field
  previewUrl?: string; // Optional for frontend items
  description: string;
  author: string;
  updatedAt: string;
}
