import { Link, useLocation } from "wouter";
import { Building, ChartLine, Calculator, Folder, Settings } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: ChartLine, label: "Dashboard" },
    { path: "/analyze", icon: Calculator, label: "New Analysis" },
    { path: "/deals", icon: Folder, label: "Past Deals" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="w-64 bg-white border-r border-neutral-200 flex flex-col">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Building className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">UnderwriteAI</h1>
            <p className="text-xs text-neutral-600">CRE Analysis</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <a className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? "text-primary bg-primary/10 font-medium" 
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}>
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">U</span>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">User</p>
              <p className="text-xs text-neutral-600">Real Estate Professional</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await fetch('/api/logout', { method: 'POST' });
              window.location.reload();
            }}
            className="text-xs text-neutral-600 hover:text-neutral-900 underline"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
