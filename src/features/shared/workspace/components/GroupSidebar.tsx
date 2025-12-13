import { Users, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Group {
  id: number;
  name: string;
  lastMessage: string;
}

interface GroupSidebarProps {
  groups: Group[];
  selectedGroupId: number;
  onSelectGroup: (id: number) => void;
}

export const GroupSidebar = ({ groups, selectedGroupId, onSelectGroup }: GroupSidebarProps) => {
  return (
    <div className="w-64 h-full bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Users className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground">Quản lý Nhóm</h1>
            <p className="text-xs text-sidebar-foreground/60">Jane Doe</p>
          </div>
        </div>
      </div>

      {/* Groups List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {groups.map((group) => (
          <div
            key={group.id}
            onClick={() => onSelectGroup(group.id)}
            className={cn(
              'sidebar-item',
              selectedGroupId === group.id && 'sidebar-item-active'
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-sidebar-accent-foreground">
                {group.name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{group.name}</p>
              <p className="text-xs truncate opacity-60">{group.lastMessage}</p>
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button className="sidebar-item w-full">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Tạo nhóm mới</span>
        </button>
        <button className="sidebar-item w-full">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Cài đặt</span>
        </button>
      </div>
    </div>
  );
};
