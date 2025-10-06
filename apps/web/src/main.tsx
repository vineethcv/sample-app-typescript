import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import TasksPage from './pages/TasksPage';

const router = createBrowserRouter([
  { path: '/', element: <TasksPage /> },
]);

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><RouterProvider router={router} /></React.StrictMode>
);