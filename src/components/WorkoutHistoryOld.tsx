import React from 'react';
import { Calendar, Clock, Target, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useWorkoutStore } from '@/lib/store';

export const WorkoutHistory = () => {
  const { workouts } = useWorkoutStore();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const getTotalSets = (exercises: any[]) => {
    return exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  };

  const getCompletedSets = (exercises: any[]) => {
    return exercises.reduce((total, exercise) => 
      total + exercise.sets.filter((set: any) => set.completed).length, 0
    );
  };

  if (workouts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-4 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Workout History</h1>
          <p className="text-muted-foreground">Track your progress over time</p>
        </div>

        <div className="text-center py-16">
          <div className="bg-card rounded-lg p-8 shadow-soft">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Workouts Yet</h3>
            <p className="text-muted-foreground">
              Complete your first workout to see your history here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Workout History</h1>
        <p className="text-muted-foreground">{workouts.length} workouts completed</p>
      </div>

      <div className="space-y-4">
        {workouts.map((workout) => {
          const workoutDate = typeof workout.date === 'string' ? new Date(workout.date) : workout.date;
          const totalSets = getTotalSets(workout.exercises);
          const completedSets = getCompletedSets(workout.exercises);
          
          return (
            <Card key={workout.id} className="p-4 shadow-soft">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {formatDate(workoutDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(workout.duration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>{completedSets}/{totalSets} sets</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {workout.exercises.length} exercises
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {workout.exercises.map((exercise) => (
                  <div key={exercise.id} className="bg-secondary/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{exercise.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {exercise.sets.filter(set => set.completed).length}/{exercise.sets.length} sets
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {exercise.sets
                        .filter(set => set.completed)
                        .map((set, index) => (
                        <div key={set.id} className="text-xs bg-success/10 text-success-foreground px-2 py-1 rounded">
                          {set.weight}lbs × {set.reps}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};