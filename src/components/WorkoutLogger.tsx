import React, { useState } from 'react';
import { Plus, Clock, Target, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ExerciseSelector } from './ExerciseSelector';
import { SetLogger } from './SetLogger';
import { useWorkoutStore } from '@/lib/store';

interface Exercise {
  id: string;
  name: string;
  sets: Array<{
    id: string;
    reps: number;
    weight: number;
    notes?: string;
    completed: boolean;
  }>;
}

export const WorkoutLogger = () => {
  const [currentWorkout, setCurrentWorkout] = useState<Exercise[]>([]);
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  const [workoutStartTime] = useState(new Date());
  const { addWorkout } = useWorkoutStore();

  const addExercise = (exerciseName: string) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName,
      sets: []
    };
    setCurrentWorkout([...currentWorkout, newExercise]);
    setIsExerciseSelectorOpen(false);
  };

  const addSet = (exerciseId: string) => {
    setCurrentWorkout(exercises => 
      exercises.map(exercise => 
        exercise.id === exerciseId 
          ? {
              ...exercise,
              sets: [...exercise.sets, {
                id: Date.now().toString(),
                reps: 0,
                weight: 0,
                completed: false
              }]
            }
          : exercise
      )
    );
  };

  const updateSet = (exerciseId: string, setId: string, updates: Partial<Exercise['sets'][0]>) => {
    setCurrentWorkout(exercises =>
      exercises.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map(set =>
                set.id === setId ? { ...set, ...updates } : set
              )
            }
          : exercise
      )
    );
  };

  const finishWorkout = () => {
    if (currentWorkout.length > 0) {
      addWorkout({
        id: Date.now().toString(),
        date: new Date(),
        exercises: currentWorkout,
        duration: Math.floor((Date.now() - workoutStartTime.getTime()) / 1000 / 60)
      });
      setCurrentWorkout([]);
    }
  };

  const getWorkoutDuration = () => {
    const minutes = Math.floor((Date.now() - workoutStartTime.getTime()) / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const totalSets = currentWorkout.reduce((total, exercise) => total + exercise.sets.length, 0);
  const completedSets = currentWorkout.reduce((total, exercise) => 
    total + exercise.sets.filter(set => set.completed).length, 0
  );

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-subtle/95 backdrop-blur-sm pb-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Current Workout</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{getWorkoutDuration()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>{completedSets}/{totalSets} sets</span>
              </div>
            </div>
          </div>
          
          {currentWorkout.length > 0 && (
            <Button 
              variant="success" 
              size="touch"
              onClick={finishWorkout}
              className="shadow-accent"
            >
              Finish Workout
            </Button>
          )}
        </div>

        {/* Add Exercise Button */}
        <Button
          variant="workout"
          size="xl"
          onClick={() => setIsExerciseSelectorOpen(true)}
          className="w-full"
        >
          <Plus className="w-5 h-5" />
          Add Exercise
        </Button>
      </div>

      {/* Exercise List */}
      <div className="space-y-4">
        {currentWorkout.map((exercise, index) => (
          <Card key={exercise.id} className="p-4 shadow-soft animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{exercise.name}</h3>
              <Button
                variant="workout"
                size="sm"
                onClick={() => addSet(exercise.id)}
                className="text-xs"
              >
                <Plus className="w-3 h-3" />
                Add Set
              </Button>
            </div>

            {exercise.sets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tap "Add Set" to start logging</p>
              </div>
            ) : (
              <div className="space-y-2">
                {exercise.sets.map((set, setIndex) => (
                  <SetLogger
                    key={set.id}
                    set={set}
                    setNumber={setIndex + 1}
                    onUpdate={(updates) => updateSet(exercise.id, set.id, updates)}
                  />
                ))}
              </div>
            )}
          </Card>
        ))}

        {currentWorkout.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-card rounded-lg p-8 shadow-soft">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Start?</h3>
              <p className="text-muted-foreground mb-6">
                Add your first exercise to begin tracking your workout
              </p>
              <Button
                variant="workout"
                size="xl"
                onClick={() => setIsExerciseSelectorOpen(true)}
              >
                <Plus className="w-5 h-5" />
                Start Workout
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Selector Modal */}
      {isExerciseSelectorOpen && (
        <ExerciseSelector
          onSelectExercise={addExercise}
          onClose={() => setIsExerciseSelectorOpen(false)}
        />
      )}
    </div>
  );
};