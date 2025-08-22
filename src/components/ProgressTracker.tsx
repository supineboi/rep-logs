import React, { useState } from 'react';
import { TrendingUp, Search, Calendar, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWorkouts } from '@/hooks/useWorkouts';

export const ProgressTracker = () => {
  const { workouts, loading } = useWorkouts();
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
        const workoutDate = new Date(workout.date);
        
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
        <p className="text-muted-foreground">Loading progress data...</p>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-16">
        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Progress Data</h3>
        <p className="text-muted-foreground">
          Complete a few workouts to start tracking your progress
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
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
              <Card key={exercise.name}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{exercise.name}</CardTitle>
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
                    
                    <Badge
                      variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}
                      className="flex items-center gap-1"
                    >
                      <TrendingUp className={`w-3 h-3 ${
                        trend === 'down' ? 'rotate-180' : 
                        trend === 'neutral' ? 'rotate-90' : ''
                      }`} />
                      {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <div className="text-xl font-bold text-foreground">{exercise.maxWeight}</div>
                      <div className="text-xs text-muted-foreground">Max Weight (lbs)</div>
                    </div>
                    
                    <div className="text-center p-3 bg-secondary/5 rounded-lg">
                      <div className="text-xl font-bold text-foreground">{exercise.maxReps}</div>
                      <div className="text-xs text-muted-foreground">Max Reps</div>
                    </div>
                  </div>

                  {/* Recent Performance */}
                  {exercise.workouts.length > 0 && (
                    <div className="pt-3 border-t border-border">
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
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};