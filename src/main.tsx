import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Nav from './Nav.tsx';
// import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Nav />
    {/* <App /> */}
  </StrictMode>
);
