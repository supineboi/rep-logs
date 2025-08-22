import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Target } from "lucide-react";
import { ExerciseSelector } from './ExerciseSelector';
import { SetLogger } from './SetLogger';
import { useWorkouts } from '@/hooks/useWorkouts';
import { toast } from 'sonner';

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
  const [saving, setSaving] = useState(false);
  const { saveWorkout } = useWorkouts();

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

  const finishWorkout = async () => {
    if (currentWorkout.length === 0) return;
    
    setSaving(true);
    try {
      const duration = Math.round((Date.now() - workoutStartTime.getTime()) / 1000 / 60); // Convert to minutes
      
      const workoutData = {
        duration,
        exercises: currentWorkout.map(exercise => ({
          name: exercise.name,
          sets: exercise.sets.map(set => ({
            reps: set.reps,
            weight: set.weight,
            notes: set.notes,
            completed: set.completed
          }))
        }))
      };
      
      await saveWorkout(workoutData);
      setCurrentWorkout([]);
      toast.success('Workout saved successfully!');
    } catch (error: any) {
      toast.error('Failed to save workout: ' + error.message);
    } finally {
      setSaving(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
            onClick={finishWorkout} 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Finish Workout'}
          </Button>
        )}
      </div>

      {/* Add Exercise Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={() => setIsExerciseSelectorOpen(true)}
        className="w-full"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Exercise
      </Button>

      {/* Exercise List */}
      <div className="space-y-4">
        {currentWorkout.map((exercise) => (
          <Card key={exercise.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{exercise.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSet(exercise.id)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Set
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        ))}

        {currentWorkout.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-card rounded-lg p-8">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Start?</h3>
              <p className="text-muted-foreground mb-6">
                Add your first exercise to begin tracking your workout
              </p>
              <Button
                variant="default"
                size="lg"
                onClick={() => setIsExerciseSelectorOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
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