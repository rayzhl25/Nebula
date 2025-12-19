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