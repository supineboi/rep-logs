import React, { useState } from 'react';
import { WorkoutLogger } from '@/components/WorkoutLogger';
import { WorkoutHistory } from '@/components/WorkoutHistory';
import { ProgressTracker } from '@/components/ProgressTracker';
import { Navigation } from '@/components/Navigation';

const Index = () => {
  const [activeTab, setActiveTab] = useState('workout');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'workout':
        return <WorkoutLogger />;
      case 'history':
        return <WorkoutHistory />;
      case 'progress':
        return <ProgressTracker />;
      default:
        return <WorkoutLogger />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderActiveTab()}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
