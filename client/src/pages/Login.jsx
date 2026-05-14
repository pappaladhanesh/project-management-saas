import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Info, Shield, User } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const validate = () => {
        const errs = {};
        if (!email.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
        if (!password) errs.password = 'Password is required';
        else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsLoading(true);
        
        try {
            await login(email, password);
            toast.success('Welcome back! Login successful');
            navigate('/dashboard'); 
        } catch (err) {
            const msg = err.response?.data?.error || 'Invalid email or password';
            toast.error(msg);
            setErrors({ general: msg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
            {/* Left Side: Login Form */}
            <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="w-full max-w-sm mx-auto lg:w-96">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">ProjectPro</h2>
                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Sign in to your account</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                                Sign up today
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8">
                        {errors.general && (
                            <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl" role="alert">
                                {errors.general}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({...errors, email: ''}); }}
                                        className={`block w-full px-4 py-3 border rounded-xl shadow-sm sm:text-sm transition-colors ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                        placeholder="admin@example.com"
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({...errors, password: ''}); }}
                                        className={`block w-full px-4 py-3 border rounded-xl shadow-sm sm:text-sm transition-colors ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                        placeholder="••••••••"
                                    />
                                    {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>}
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex justify-center items-center gap-2 w-full px-4 py-3 text-sm font-semibold text-white bg-indigo-600 border border-transparent rounded-xl shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </div>
                        </form>

                        {/* Demo Credentials Section */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-800/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Demo Credentials</h3>
                                </div>
                                <div className="space-y-3">
                                    <button 
                                        type="button" 
                                        onClick={() => { setEmail('admin@test.com'); setPassword('member123'); setErrors({}); }}
                                        className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow border border-gray-100 dark:border-gray-700 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                                                <Shield className="w-4 h-4" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Admin Role</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Full access & settings</p>
                                            </div>
                                        </div>
                                        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                                            Fill Admin
                                        </div>
                                    </button>
                                    
                                    <button 
                                        type="button" 
                                        onClick={() => { setEmail('member@test.com'); setPassword('member123'); setErrors({}); }}
                                        className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow border border-gray-100 dark:border-gray-700 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Member Role</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Assigned tasks only</p>
                                            </div>
                                        </div>
                                        <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                                            Fill Member
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Right Side: Split Screen Background Image */}
            <div className="hidden w-0 flex-1 lg:block relative">
                <div className="absolute inset-0 bg-indigo-600 mix-blend-multiply opacity-20 z-10"></div>
                <img
                    className="absolute inset-0 object-cover w-full h-full"
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80"
                    alt="Team collaborating on a project"
                />
            </div>
        </div>
    );
};

export default Login;