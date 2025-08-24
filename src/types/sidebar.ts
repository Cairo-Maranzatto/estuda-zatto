export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'error';
  };
  onClick?: () => void;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}
