import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
  userId: string;
  date: Date;
  exercises: Exercise[];
  duration: number;
}

interface WorkoutState {
  workouts: Workout[];
  friendWorkouts: { [friendId: string]: Workout[] };
  loading: boolean;
  error: string | null;
}

const initialState: WorkoutState = {
  workouts: [],
  friendWorkouts: {},
  loading: false,
  error: null,
};

// Demo workout data
const DEMO_WORKOUTS: Workout[] = [
  {
    id: '1',
    userId: '1',
    date: new Date('2024-01-20'),
    duration: 65,
    exercises: [
      {
        id: '1',
        name: 'Bench Press',
        sets: [
          { id: '1', reps: 10, weight: 185, completed: true, notes: 'Good form' },
          { id: '2', reps: 8, weight: 195, completed: true },
          { id: '3', reps: 6, weight: 205, completed: true, notes: 'Struggled on last rep' },
        ],
      },
      {
        id: '2',
        name: 'Squats',
        sets: [
          { id: '4', reps: 12, weight: 225, completed: true },
          { id: '5', reps: 10, weight: 235, completed: true },
          { id: '6', reps: 8, weight: 245, completed: true, notes: 'Full ROM' },
        ],
      },
    ],
  },
];

const DEMO_FRIEND_WORKOUTS: { [key: string]: Workout[] } = {
  '2': [
    {
      id: '2',
      userId: '2',
      date: new Date('2024-01-19'),
      duration: 45,
      exercises: [
        {
          id: '3',
          name: 'Deadlifts',
          sets: [
            { id: '7', reps: 5, weight: 275, completed: true, notes: 'PR!' },
            { id: '8', reps: 5, weight: 285, completed: true },
          ],
        },
      ],
    },
  ],
};

export const fetchUserWorkouts = createAsyncThunk(
  'workout/fetchUserWorkouts',
  async (userId: string) => {
    // TODO: Replace with real API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (userId === '1') {
      return DEMO_WORKOUTS;
    }
    
    return [];
  }
);

export const fetchFriendWorkouts = createAsyncThunk(
  'workout/fetchFriendWorkouts',
  async (friendId: string) => {
    // TODO: Replace with real API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      friendId,
      workouts: DEMO_FRIEND_WORKOUTS[friendId] || [],
    };
  }
);

export const saveWorkout = createAsyncThunk(
  'workout/save',
  async (workout: Omit<Workout, 'id'>) => {
    // TODO: Replace with real API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newWorkout = {
      ...workout,
      id: Date.now().toString(),
    };
    
    return newWorkout;
  }
);

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user workouts
      .addCase(fetchUserWorkouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserWorkouts.fulfilled, (state, action) => {
        state.loading = false;
        state.workouts = action.payload;
      })
      .addCase(fetchUserWorkouts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch workouts';
      })
      // Fetch friend workouts
      .addCase(fetchFriendWorkouts.fulfilled, (state, action) => {
        state.friendWorkouts[action.payload.friendId] = action.payload.workouts;
      })
      // Save workout
      .addCase(saveWorkout.fulfilled, (state, action) => {
        state.workouts.unshift(action.payload);
      });
  },
});

export const { clearError } = workoutSlice.actions;
export default workoutSlice.reducer;