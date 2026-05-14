import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';

const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

            {/* Main Application Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:hidden z-10 transition-colors duration-200">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600">
                        <Menu size={24} />
                    </button>
                    <span className="text-xl font-bold text-indigo-600">ProjectPro</span>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
                    {/* The <Outlet /> renders whatever page is active (Dashboard, Projects, etc) */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;