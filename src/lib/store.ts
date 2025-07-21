import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Set {
  id: string;
  reps: number;
  weight: number;
  notes?: string;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

interface Workout {
  id: string;
  date: Date;
  exercises: Exercise[];
  duration: number; // in minutes
}

interface WorkoutStore {
  workouts: Workout[];
  addWorkout: (workout: Workout) => void;
  getWorkoutHistory: (exerciseName: string) => Workout[];
  getLastWorkout: () => Workout | null;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      workouts: [],
      
      addWorkout: (workout) => {
        // Convert date to string for storage
        const workoutToStore = {
          ...workout,
          date: workout.date.toISOString()
        };
        
        set((state) => ({
          workouts: [workoutToStore as any, ...state.workouts]
        }));
      },
      
      getWorkoutHistory: (exerciseName) => {
        const { workouts } = get();
        return workouts
          .map(workout => ({
            ...workout,
            date: typeof workout.date === 'string' ? new Date(workout.date) : workout.date
          }))
          .filter(workout =>
            workout.exercises.some(exercise => 
              exercise.name.toLowerCase() === exerciseName.toLowerCase()
            )
          );
      },
      
      getLastWorkout: () => {
        const { workouts } = get();
        if (workouts.length === 0) return null;
        
        const lastWorkout = workouts[0];
        return {
          ...lastWorkout,
          date: typeof lastWorkout.date === 'string' ? new Date(lastWorkout.date) : lastWorkout.date
        };
      }
    }),
    {
      name: 'workout-storage'
    }
  )
);