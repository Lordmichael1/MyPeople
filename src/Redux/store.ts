import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { profileSlice } from './profileSlice'; // Import your existing slices

// Profile persist config
const profilePersistConfig = {
  key: 'profile',
  storage,
  whitelist: ['profileImage', 'username', 'email'], // Only persist these fields
};

// If you have other slices, add them here
const persistedProfileReducer = persistReducer(profilePersistConfig, profileSlice.reducer);

export const store = configureStore({
  reducer: {
    profile: persistedProfileReducer,
    // Add your other existing reducers here
    // contacts: contactsReducer,
    // auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
