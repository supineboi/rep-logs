import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Set {
  id: string;
  reps: number;
  weight: number;
  notes?: string;
  completed: boolean;
  order_index: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  order_index: number;
}

export interface Workout {
  id: string;
  user_id: string;
  date: string;
  duration: number;
  notes?: string;
  exercises: Exercise[];
}

export const useWorkouts = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch workouts with exercises and sets
  const fetchWorkouts = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select(`
          *,
          exercises (
            *,
            sets (*)
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (workoutsError) throw workoutsError;

      // Transform data to match our interface
      const transformedWorkouts: Workout[] = (workoutsData || []).map(workout => ({
        ...workout,
        exercises: (workout.exercises || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((exercise: any) => ({
            ...exercise,
            sets: (exercise.sets || []).sort((a: any, b: any) => a.order_index - b.order_index)
          }))
      }));

      setWorkouts(transformedWorkouts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save a complete workout
  const saveWorkout = async (workoutData: {
    duration: number;
    exercises: Array<{
      name: string;
      sets: Array<{
        reps: number;
        weight: number;
        notes?: string;
        completed: boolean;
      }>;
    }>;
    notes?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Start transaction by creating workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          duration: workoutData.duration,
          notes: workoutData.notes,
          date: new Date().toISOString()
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Create exercises and sets
      for (let i = 0; i < workoutData.exercises.length; i++) {
        const exerciseData = workoutData.exercises[i];
        
        const { data: exercise, error: exerciseError } = await supabase
          .from('exercises')
          .insert({
            workout_id: workout.id,
            name: exerciseData.name,
            order_index: i
          })
          .select()
          .single();

        if (exerciseError) throw exerciseError;

        // Create sets for this exercise
        const setsToInsert = exerciseData.sets.map((set, setIndex) => ({
          exercise_id: exercise.id,
          reps: set.reps,
          weight: set.weight,
          notes: set.notes,
          completed: set.completed,
          order_index: setIndex
        }));

        const { error: setsError } = await supabase
          .from('sets')
          .insert(setsToInsert);

        if (setsError) throw setsError;
      }

      // Refresh workouts
      await fetchWorkouts();
      return workout;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Get workout history for a specific exercise
  const getExerciseHistory = (exerciseName: string) => {
    return workouts
      .filter(workout =>
        workout.exercises.some(exercise =>
          exercise.name.toLowerCase() === exerciseName.toLowerCase()
        )
      )
      .map(workout => ({
        ...workout,
        exercises: workout.exercises.filter(exercise =>
          exercise.name.toLowerCase() === exerciseName.toLowerCase()
        )
      }));
  };

  // Get last workout
  const getLastWorkout = () => {
    return workouts.length > 0 ? workouts[0] : null;
  };

  useEffect(() => {
    if (user) {
      fetchWorkouts();

      // Set up real-time subscription
      const channel = supabase
        .channel('workout-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'workouts',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchWorkouts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    workouts,
    loading,
    error,
    saveWorkout,
    getExerciseHistory,
    getLastWorkout,
    refetch: fetchWorkouts
  };
};