import type { IconName } from '@package/icons';

export interface SidebarItem {
  label: string;
  icon: IconName;
  path: string;
  matchPath?: string;
  badge?: number;
}

export interface SidebarItems {
  UPPER: SidebarItem[];
  LOWER: SidebarItem[];
}
