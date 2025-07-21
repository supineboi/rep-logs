import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from './authSlice';

export interface Friend extends User {
  status: 'pending' | 'accepted';
  connectedAt: string;
}

interface FriendsState {
  friends: Friend[];
  pendingInvites: { email: string; sentAt: string }[];
  loading: boolean;
  error: string | null;
}

const initialState: FriendsState = {
  friends: [],
  pendingInvites: [],
  loading: false,
  error: null,
};

// Demo friends data
const DEMO_FRIENDS: Friend[] = [
  {
    id: '2',
    name: 'Sarah Smith',
    email: 'sarah@demo.com',
    status: 'accepted',
    connectedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@demo.com',
    status: 'accepted',
    connectedAt: '2024-01-10T14:30:00Z',
  },
];

export const inviteFriend = createAsyncThunk(
  'friends/invite',
  async (email: string) => {
    // TODO: Replace with real API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const invite = {
      email,
      sentAt: new Date().toISOString(),
    };
    
    return invite;
  }
);

export const fetchFriends = createAsyncThunk(
  'friends/fetchFriends',
  async (userId: string) => {
    // TODO: Replace with real API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return demo friends for user 1
    if (userId === '1') {
      return DEMO_FRIENDS;
    }
    
    return [];
  }
);

export const acceptFriendRequest = createAsyncThunk(
  'friends/acceptRequest',
  async (friendId: string) => {
    // TODO: Replace with real API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const friend = DEMO_FRIENDS.find(f => f.id === friendId);
    if (friend) {
      return { ...friend, status: 'accepted' as const };
    }
    
    throw new Error('Friend not found');
  }
);

const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Invite friend
      .addCase(inviteFriend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inviteFriend.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingInvites.push(action.payload);
      })
      .addCase(inviteFriend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send invite';
      })
      // Fetch friends
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch friends';
      })
      // Accept friend request
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        const index = state.friends.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.friends[index] = action.payload;
        }
      });
  },
});

export const { clearError } = friendsSlice.actions;
export default friendsSlice.reducer;