import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login/Login';
import ChangePassword from './components/Auth/ChangePassword';

import Dashboard from './components/Dashboard/Dashboard';
import Sales from './components/Sales/Sales';
import Inventory from './components/Inventory/Inventory';
import Profile from './components/Profile/Profile';
import Employees from './components/Employees/Employees';
import LoginHistory from './components/LoginHistory/LoginHistory';
// import ActivateAccount from './components/Auth/ActivateAccount';
import SplashScreen from './components/SplashScreen/SplashScreen';
import { useState } from 'react';

import Reports from './components/Reports/Reports';

import { ColorModeProvider } from './context/ThemeContext';

function App() {
  const [loading, setLoading] = useState(() => {
    return !sessionStorage.getItem('splashShown');
  });

  const handleSplashFinish = () => {
    sessionStorage.setItem('splashShown', 'true');
    setLoading(false);
  };

  return (
    <ColorModeProvider>
      <div className="App">
        {loading ? (
          <SplashScreen onFinish={handleSplashFinish} />
        ) : (
          <>
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/change-password" element={<ChangePassword />} />
              {/* <Route path="/signup" element={<Signup />} /> */}
              {/* <Route path="/activate/:token" element={<ActivateAccount />} /> */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/login-history" element={<LoginHistory />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </>
        )}
      </div>
    </ColorModeProvider>
  );
}

export default App;
