import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validate = () => {
        const errs = {};
        if (!name.trim()) errs.name = 'Full name is required';
        if (!email.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';
        if (!password) errs.password = 'Password is required';
        else if (password.length < 6) errs.password = 'Min. 6 characters';
        if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsLoading(true);
        try {
            await api.post('/auth/register', { name, email, password });
            toast.success('Account created! Please sign in.');
            navigate('/login');
        } catch (err) {
            const msg = err.response?.data?.error || 'Registration failed';
            toast.error(msg);
            setErrors({ general: msg });
        } finally {
            setIsLoading(false);
        }
    };

    const ic = (f) => `w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${errors[f] ? 'border-red-400' : 'border-gray-300'}`;

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                    <p className="text-sm text-gray-500 mt-2">Sign up to get started</p>
                </div>
                {errors.general && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center border border-red-100">{errors.general}</div>}
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" value={name} onChange={e => { setName(e.target.value); if(errors.name) setErrors({...errors, name:''}); }} className={ic('name')} placeholder="John Doe" />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input type="email" value={email} onChange={e => { setEmail(e.target.value); if(errors.email) setErrors({...errors, email:''}); }} className={ic('email')} placeholder="john@example.com" />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" value={password} onChange={e => { setPassword(e.target.value); if(errors.password) setErrors({...errors, password:''}); }} className={ic('password')} placeholder="Min. 6 characters" />
                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input type="password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); if(errors.confirmPassword) setErrors({...errors, confirmPassword:''}); }} className={ic('confirmPassword')} placeholder="Re-enter password" />
                        {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full py-3 px-4 text-white font-semibold bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? 'Creating...' : 'Sign Up'}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;