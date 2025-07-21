import React from 'react';
import { Dumbbell, Calendar, TrendingUp, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'history', label: 'History', icon: Calendar },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant={isActive ? 'workout' : 'ghost'}
              size="touch"
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 mx-1 flex-col gap-1 h-16 ${
                isActive ? 'text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};