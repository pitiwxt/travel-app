import React, { useState, useEffect, Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseSetup';
import LoginScreen from './components/LoginScreen';
import SplashScreen from './components/SplashScreen';

// Lay load the heavy Main application
const MainApp = React.lazy(() => import('./MainApp'));

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('travel_theme') || 'light');
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Authenticate user
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('travel_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  if (authLoading) return <SplashScreen text="กำลังตรวจสอบสิทธิ์..." subText="กรุณารอสักครู่" />;
  if (!currentUser) return <LoginScreen />;

  return (
    <Suspense fallback={<SplashScreen text="กำลังเตรียมข้อมูลแผนการเดินทาง..." subText="กำลังโหลดเนื้อหาภูมิภาคคันไซ" />}>
      <MainApp currentUser={currentUser} theme={theme} toggleTheme={toggleTheme} />
    </Suspense>
  );
}
