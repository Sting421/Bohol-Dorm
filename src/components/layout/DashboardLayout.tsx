import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Users, DoorOpen, CreditCard, LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Tenants",
      href: "/tenants",
      icon: (
        <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Rooms",
      href: "/rooms",
      icon: (
        <DoorOpen className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Payments",
      href: "/payments",
      icon: (
        <CreditCard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col md:flex-row bg-background w-full flex-1 overflow-hidden"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => ( 
                <SidebarLink 
                  key={idx} 
                  link={{
                    ...link,
                    href: link.href,
                  }}
                  className={cn(
                    pathname === link.href && "bg-neutral-200 dark:bg-neutral-700"
                  )}
                />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: user?.name || "User",
                href: "#",
                icon: (
                  <div className="w-7 h-7 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                ),
              }}
              onClick={(e) => {
                e.preventDefault();
                logout();
                navigate('/');
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

const Logo = () => {
  return (
    <div className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20">
      <img 
        src="/boholDorm.png" 
        alt="Dorm Hub" 
        className="h-8 w-8 rounded-lg object-cover" 
        onError={(e) => {
          e.currentTarget.src = '/fallback-logo.png';
        }}
      />
      <span className="font-medium whitespace-pre">
        Dorm Hub
      </span>
    </div>
  );
};
