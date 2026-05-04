import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, AlertCircle, User, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [loginType, setLoginType] = useState('student'); // 'student' or 'admin'
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // If navigated from Admin button in navbar, default to admin
    useEffect(() => {
        if (location.state?.type === 'admin') {
            setLoginType('admin');
            setCredentials({ email: 'admin@exam.com', password: 'admin123' });
        }
    }, [location]);

    const handleTypeSwitch = (type) => {
        setError('');
        setLoginType(type);
        if (type === 'admin') {
            setCredentials({ email: 'admin@exam.com', password: 'admin123' });
        } else {
            setCredentials({ email: '', password: '' });
        }
    };

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const res = await api.post('/auth/login', credentials);
            login(res.data);
            
            if (res.data.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply opacity-50 blur-3xl"></div>
                <div className="absolute top-1/2 left-2/3 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply opacity-50 blur-3xl"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center">
                    <div className="w-14 h-14 bg-white shadow-xl rounded-2xl flex items-center justify-center transform -rotate-6">
                        <BookOpen className="h-8 w-8 text-primary-600 transform rotate-6" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Welcome Back
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {loginType === 'student' ? 'Sign in to access your exams or ' : 'Secure admin access portal'}
                    {loginType === 'student' && (
                        <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                            create a new account
                        </Link>
                    )}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-3xl border border-white sm:px-10">
                    
                    {/* Login Type Toggle */}
                    <div className="flex bg-gray-100/80 p-1.5 rounded-xl mb-8 backdrop-blur-sm">
                        <button
                            type="button"
                            onClick={() => handleTypeSwitch('student')}
                            className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${loginType === 'student' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <User className="h-4 w-4" />
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeSwitch('admin')}
                            className={`flex-1 flex justify-center items-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${loginType === 'admin' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-100' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Admin
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50/80 border border-red-200 rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm shadow-sm">
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                            <div className="mt-1">
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={credentials.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder={loginType === 'student' ? "student@example.com" : "admin@exam.com"}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                            <div className="mt-1">
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={credentials.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all duration-200 ${
                                    loginType === 'admin' 
                                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-500/30' 
                                        : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-primary-500/30'
                                } hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed transform-none' : ''}`}
                            >
                                {loading ? 'Authenticating...' : (loginType === 'admin' ? 'Secure Admin Login' : 'Sign in as Student')}
                            </button>
                        </div>
                    </form>
                    
                    {loginType === 'admin' && (
                        <div className="mt-8 text-center bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                            <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wide mb-1 flex items-center justify-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5" /> Authorization Notice
                            </p>
                            <p className="text-xs text-indigo-600/80">Default admin configuration automatically loads credentials.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
