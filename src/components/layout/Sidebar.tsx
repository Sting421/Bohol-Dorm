import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Users, DoorOpen, CreditCard, LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type NavItemProps = {
  icon: React.ElementType;
  label: string;
  href: string;
  active: boolean;
};

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, href, active }) => {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(href)}
      className={cn(
        "flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors",
        active 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="mr-2 h-4 w-4" />
      <span>{label}</span>
    </button>
  );
};

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const pathname = window.location.pathname;
  
  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Tenants", href: "/tenants" },
    { icon: DoorOpen, label: "Rooms", href: "/rooms" },
    { icon: CreditCard, label: "Payments", href: "/payments" },
  ];
  
  return (
    <div 
      className={cn(
        "bg-sidebar fixed top-0 left-0 z-40 h-full w-[280px] transition-all duration-300 ease-in-out transform",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0" // Always visible on large screens
      )}
    >
      <div className="h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="h-16 px-6 flex items-center border-b border-sidebar-border mt-12">
          <h1 className="text-2xl font-bold text-sidebar-foreground ">Dorm Hub</h1>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={pathname === item.href}
            />
          ))}
        </div>
        
        {/* User Menu */}
        <div className="p-6 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground mr-2">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left mr-1 truncate">
                    {user?.name}
                  </div>
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/50" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-y-1">
                <span>{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.role}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer flex items-center"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
