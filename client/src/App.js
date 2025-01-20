import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
/** import all components */
import Username from './pages/Username';
import Password from './pages/Password';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Recovery from './pages/Recovery';
import Reset from './pages/Reset';
import PageNotFound from './pages/PageNotFound';
import { AuthorizeUser } from './middleware/auth'
//root routes
const router = createBrowserRouter([
    {
        path : '/',
        element : <Username></Username>
    },
    {
        path : '/register',
        element : <Register></Register>
    },
    {
        path : '/password',
        element :<Password></Password>
    },
    {
        path : '/profile',
        element : <AuthorizeUser><Profile /></AuthorizeUser>
    },
    {
        path : '/recovery',
        element : <Recovery></Recovery>
    },
    {
        path : '/reset',
        element : <Reset></Reset>
    },
    {
        path : '*',
        element : <PageNotFound></PageNotFound>
    },
])


export default function App() {
    return (
      <main>
          <RouterProvider router={router}></RouterProvider>
      </main>
    )
  }
  