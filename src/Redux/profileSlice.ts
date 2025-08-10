import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProfileState {
  profileImage: string | null;
  username: string | null;
  email: string | null;
}

interface ProfileData {
  profileImage?: string | null;
  username?: string | null;
  email?: string | null;
}

const initialState: ProfileState = {
  profileImage: null,
  username: null,
  email: null,
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileImage: (state, action: PayloadAction<string | null>) => {
      state.profileImage = action.payload;
    },
    setUsername: (state, action: PayloadAction<string | null>) => {
      state.username = action.payload;
    },
    setEmail: (state, action: PayloadAction<string | null>) => {
      state.email = action.payload;
    },
    loadProfile: (state, action: PayloadAction<ProfileData>) => {
      if (action.payload.profileImage !== undefined) {
        state.profileImage = action.payload.profileImage;
      }
      if (action.payload.username !== undefined) {
        state.username = action.payload.username;
      }
      if (action.payload.email !== undefined) {
        state.email = action.payload.email;
      }
    },
    clearProfile: (state) => {
      state.profileImage = null;
      state.username = null;
      state.email = null;
    },
  },
});

export const { 
  setProfileImage, 
  setUsername, 
  setEmail, 
  loadProfile, 
  clearProfile 
} = profileSlice.actions;

export default profileSlice.reducer;