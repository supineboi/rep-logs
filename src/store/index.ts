import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import friendsReducer from './slices/friendsSlice';
import profileReducer from './slices/profileSlice';
import workoutReducer from './slices/workoutSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    friends: friendsReducer,
    profile: profileReducer,
    workout: workoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;