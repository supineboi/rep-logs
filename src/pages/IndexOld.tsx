import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { WorkoutLogger } from '@/components/WorkoutLogger';
import { WorkoutHistory } from '@/components/WorkoutHistory';
import { ProgressTracker } from '@/components/ProgressTracker';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Navigation } from '@/components/Navigation';
import { checkAuth } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store';

const Index = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('workout');

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'workout':
        return <WorkoutLogger />;
      case 'history':
        return <WorkoutHistory />;
      case 'progress':
        return <ProgressTracker />;
      case 'profile':
        return <ProfilePage />;
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
