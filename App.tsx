import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import AdminView from './components/AdminView';
import UserView from './components/UserView';
import { useSyncData } from './hooks/useSyncData';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginSuccess, setShowLoginSuccess] = useState(false);
    const data = useSyncData(); // Hook to get all realtime data

    // Check session storage on initial load
    useEffect(() => {
        if (sessionStorage.getItem('isAdminAuthenticated') === 'true') {
            setIsAuthenticated(true);
        }
    }, []);
    
    const handleLoginSuccess = () => {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        setIsAuthenticated(true);
        setShowLoginSuccess(true);
        setTimeout(() => setShowLoginSuccess(false), 3000); // Hide notification after 3 seconds
    };

    const handleLogout = () => {
        sessionStorage.removeItem('isAdminAuthenticated');
        setIsAuthenticated(false);
        // Redirect to home page
        window.location.href = '/';
    };

    const isLoginRoute = window.location.pathname.includes('/adminrahasiaini');

    return (
        <>
            {showLoginSuccess && (
                <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
                    Berhasil login!
                </div>
            )}
            {isLoginRoute ? (
                isAuthenticated ? (
                    <AdminView data={data} onLogout={handleLogout} />
                ) : (
                    <LoginPage onLoginSuccess={handleLoginSuccess} />
                )
            ) : (
                <UserView data={data} />
            )}
        </>
    );
};

export default App;
