import { createBrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import NotFound from './pages/NotFound.tsx'
import Resources from './pages/Resources.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
    children: [
      {
        index: true,
        element: <Home />, 
      },
      {
        path: 'resources',
        element: <Resources />, 
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />, 
  },
])
