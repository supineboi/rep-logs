import React, { useState } from 'react';
import { TrendingUp, Search, Calendar, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useWorkoutStore } from '@/lib/store';

export const ProgressTracker = () => {
  const { workouts } = useWorkoutStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Get all unique exercises from workout history
  const getAllExercises = () => {
    const exerciseMap = new Map();
    
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (!exerciseMap.has(exercise.name)) {
          exerciseMap.set(exercise.name, {
            name: exercise.name,
            workouts: [],
            totalSets: 0,
            maxWeight: 0,
            maxReps: 0,
            lastPerformed: null
          });
        }
        
        const exerciseData = exerciseMap.get(exercise.name);
        const workoutDate = typeof workout.date === 'string' ? new Date(workout.date) : workout.date;
        
        exerciseData.workouts.push({
          date: workoutDate,
          sets: exercise.sets.filter(set => set.completed)
        });
        
        exerciseData.totalSets += exercise.sets.filter(set => set.completed).length;
        
        exercise.sets.forEach(set => {
          if (set.completed) {
            exerciseData.maxWeight = Math.max(exerciseData.maxWeight, set.weight);
            exerciseData.maxReps = Math.max(exerciseData.maxReps, set.reps);
          }
        });
        
        if (!exerciseData.lastPerformed || workoutDate > exerciseData.lastPerformed) {
          exerciseData.lastPerformed = workoutDate;
        }
      });
    });
    
    return Array.from(exerciseMap.values())
      .sort((a, b) => (b.lastPerformed?.getTime() || 0) - (a.lastPerformed?.getTime() || 0));
  };

  const filteredExercises = getAllExercises().filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getProgressTrend = (exercise: any) => {
    if (exercise.workouts.length < 2) return 'neutral';
    
    const recent = exercise.workouts.slice(0, 2);
    const latestMax = Math.max(...recent[0].sets.map((s: any) => s.weight));
    const previousMax = Math.max(...recent[1].sets.map((s: any) => s.weight));
    
    if (latestMax > previousMax) return 'up';
    if (latestMax < previousMax) return 'down';
    return 'neutral';
  };

  if (workouts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-4 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Progress Tracker</h1>
          <p className="text-muted-foreground">Monitor your strength gains</p>
        </div>

        <div className="text-center py-16">
          <div className="bg-card rounded-lg p-8 shadow-soft">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Progress Data</h3>
            <p className="text-muted-foreground">
              Complete a few workouts to start tracking your progress
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Progress Tracker</h1>
        <p className="text-muted-foreground">Monitor your strength gains over time</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </div>

      {/* Exercise Progress List */}
      <div className="space-y-4">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No exercises found</p>
          </div>
        ) : (
          filteredExercises.map((exercise) => {
            const trend = getProgressTrend(exercise);
            
            return (
              <Card key={exercise.name} className="p-4 shadow-soft">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{exercise.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{exercise.lastPerformed ? formatDate(exercise.lastPerformed) : 'Never'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{exercise.totalSets} total sets</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    trend === 'up' ? 'bg-success/10 text-success' :
                    trend === 'down' ? 'bg-destructive/10 text-destructive' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${
                      trend === 'down' ? 'rotate-180' : 
                      trend === 'neutral' ? 'rotate-90' : ''
                    }`} />
                    {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-xl font-bold text-foreground">{exercise.maxWeight}</div>
                    <div className="text-xs text-muted-foreground">Max Weight (lbs)</div>
                  </div>
                  
                  <div className="text-center p-3 bg-accent/5 rounded-lg">
                    <div className="text-xl font-bold text-foreground">{exercise.maxReps}</div>
                    <div className="text-xs text-muted-foreground">Max Reps</div>
                  </div>
                </div>

                {/* Recent Performance */}
                {exercise.workouts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-xs font-medium text-muted-foreground mb-2">Recent Performance</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {exercise.workouts[0].sets.slice(0, 3).map((set: any, index: number) => (
                        <div key={index} className="text-xs bg-secondary px-2 py-1 rounded">
                          {set.weight}lbs × {set.reps}
                        </div>
                      ))}
                      {exercise.workouts[0].sets.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{exercise.workouts[0].sets.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};