import { useEffect, useState } from 'react';
import { Bell, User, ChevronDown, Calendar, Clock, LogOut } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  currentSubTab: string;
  onTabChange: (tab: string, subTab?: string) => void;
}

export default function Header({ currentTab, currentSubTab, onTabChange }: HeaderProps) {
  const [time, setTime] = useState(new Date('2026-07-06T19:54:10')); // Seed with image time

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => new Date(prevTime.getTime() + 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Human friendly breadcrumb names
  const getTabLabel = (tab: string) => {
    const labels: Record<string, string> = {
      dashboard: 'Dashboard',
      inventory: 'Inventory',
      purchase: 'Purchase',
      sales: 'Sales',
      banking: 'Banking',
      accounting: 'Accounting',
      loan: 'Loan',
      reports: 'Reports',
      gridReport: 'Grid Report',
      rdlReport: 'RDL Report',
      settings: 'Settings',
      employee: 'Employee',
      salary: 'Salary',
    };
    return labels[tab] || tab;
  };

  const getSubTabLabel = (subTab: string) => {
    return subTab
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white px-6 flex items-center justify-between shrink-0 select-none">
      {/* Breadcrumb / Section indicator */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-800 font-display">
          {getTabLabel(currentTab)}
        </span>
        {currentSubTab && (
          <>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {getSubTabLabel(currentSubTab)}
            </span>
          </>
        )}
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-4">
        {/* Live clock and date */}
        <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-500 bg-slate-50/80 border border-slate-100 rounded-lg px-3 py-1.5 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-indigo-500" />
            <span>{formatDate(time)}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-indigo-500" />
            <span className="font-semibold text-slate-700">{formatTime(time)}</span>
          </div>
        </div>

        {/* Store branch switcher matching screenshot */}
        <div className="relative group">
          <button className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>MAIN — M/S Madani Traders</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>

        {/* User profile with initials avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-bold text-slate-800">madani</span>
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase self-end">Admin</span>
          </div>
          <div className="relative group">
            <button className="h-9 w-9 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/10">
              M
            </button>
            {/* Quick dropdown menu on hover / click */}
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="p-3 border-b border-slate-100 text-xs">
                <p className="font-bold text-slate-800">M/S Madani Traders</p>
                <p className="text-slate-400 mt-0.5">ronymia2022@gmail.com</p>
              </div>
              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => onTabChange('settings', 'system_settings')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                >
                  System Settings
                </button>
                <button
                  onClick={() => onTabChange('employee', 'employees_list')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                >
                  My Profile
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button className="w-full flex items-center gap-2 text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition-colors font-medium">
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout Session</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
