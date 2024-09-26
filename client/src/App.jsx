import React, { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Button } from './components/ui/button'
import { apiClient } from './lib/api-client'
import Auth from './pages/auth'
import Chat from './pages/chat'
import Profile from './pages/profile'
import { useAppStore } from './store'
import { GET_USER_INFO } from './utils/constants'

const PrivateRoute = ({children})=> {
  const {userInfo} = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? children : <Navigate to="/auth" />;
}

const AuthRoute = ({children})=> {
  const {userInfo} = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? <Navigate to="/chat" /> : children;
}

const App = () => {

  const {userInfo, setUserInfo} = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
        try {
            const response = await apiClient.get(GET_USER_INFO, { withCredentials: true });
            if (response?.data?.user) {
                setUserInfo(response.data.user);
            } else {
                setUserInfo(null);
            }
        } catch (error) {
            console.log("User Data Error: ", error);
            setUserInfo(null);
        } finally {
            setLoading(false); // Ensure loading is stopped after the fetch attempt
        }
    };
    if (!userInfo) {
        getUserData();
    } else {
        setLoading(false); // If userInfo is already set, stop loading
    }
}, [userInfo, setUserInfo]);
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/auth' element={<AuthRoute><Auth/></AuthRoute>}/>
        <Route path='/chat' element={<PrivateRoute><Chat/></PrivateRoute>}/>
        <Route path='/profile' element={<PrivateRoute><Profile/></PrivateRoute>}/>
        <Route path="*" element={<Navigate to="/auth" />}/> 
      </Routes>
    </BrowserRouter>
  )
}

export default App
