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
