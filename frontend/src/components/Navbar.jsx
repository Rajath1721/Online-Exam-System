import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="bg-gradient-to-br from-primary-600 to-indigo-600 p-2 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-indigo-700">
                                ExamPro
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link 
                                    to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                                    className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="font-medium">{user.name}</span>
                                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-500 capitalize">{user.role}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-1.5 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-4">
                                <Link to="/login" className="flex items-center justify-center text-gray-600 hover:text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 border border-primary-700/50">
                                    Register
                                </Link>
                                <div className="h-8 w-px bg-gray-200 hidden sm:block mx-1"></div>
                                <Link to="/login" state={{ type: 'admin' }} className="hidden sm:flex items-center gap-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-indigo-200 shadow-sm">
                                    <User className="h-4 w-4" />
                                    Admin Login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
