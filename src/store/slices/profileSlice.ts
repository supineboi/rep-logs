import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from './authSlice';

interface ProfileState {
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  loading: false,
  error: null,
};

export const updateProfile = createAsyncThunk(
  'profile/update',
  async ({ name, email }: { name: string; email: string }) => {
    // TODO: Replace with real API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const updatedUser = { name, email };
    
    // Update localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const updated = { ...user, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    }
    
    return updatedUser;
  }
);

export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
    // TODO: Replace with real API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For demo purposes, just simulate success
    if (currentPassword !== 'demo123') {
      throw new Error('Current password is incorrect');
    }
    
    return 'Password updated successfully';
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update profile';
      })
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to change password';
      });
  },
});

export const { clearError } = profileSlice.actions;
export default profileSlice.reducer;