import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Home, Folder, CheckSquare, Users, LogOut, X, Moon, Sun } from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
    const { user, logout } = useContext(AuthContext);
    const { darkMode, toggleTheme } = useContext(ThemeContext);

    const navItems = [
        { name: 'Home', path: '/dashboard', icon: Home, roles: ['Admin', 'Member'] },
        { name: 'Projects', path: '/projects', icon: Folder, roles: ['Admin', 'Member'] },
        { name: 'Tasks', path: '/tasks', icon: CheckSquare, roles: ['Admin', 'Member'] },
        { name: 'Manage Users', path: '/users', icon: Users, roles: ['Admin'] },
    ];

    return (
        <aside className={`fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-gray-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${isOpen? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800">
                <span className="text-2xl font-bold text-white tracking-wide">ProjectPro</span>
                <button onClick={closeSidebar} className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-slate-800">
                    <X size={20} />
                </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navItems.filter(item => item.roles.includes(user?.role)).map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => 
                            `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                                isActive? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="h-5 w-5 opacity-90" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 bg-slate-950 border-t border-slate-800">
                <div className="flex items-center mb-4 p-2 justify-between">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Toggle Theme">
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
                <button onClick={logout} className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 bg-red-400/10 rounded-xl hover:bg-red-400/20 hover:text-red-300 transition-colors">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;