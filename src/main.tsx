import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import './index.css';
import Nav from './Nav';
import { store, persistor } from './Redux/store';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Nav />
        </PersistGate>
      </Provider>
    </React.StrictMode>
  );
} else {
  console.error('Root container missing in index.html');
}
