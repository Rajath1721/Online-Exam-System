import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { CheckCircle, Clock, Shield } from 'lucide-react';

const Home = () => {
    return (
        <Layout>
            <div className="py-12 flex flex-col items-center text-center">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
                    Master Your Exams with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">ExamPro</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mb-10">
                    A modern, secure, and comprehensive online assessment platform for students and educators.
                </p>
                
                <div className="flex gap-4 mb-20">
                    <Link to="/register" className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-lg transition-transform hover:-translate-y-1 shadow-lg shadow-primary-500/30">
                        Get Started
                    </Link>
                    <Link to="/login" className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 rounded-xl font-semibold text-lg transition-colors">
                        Sign In
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
                    <FeatureCard 
                        icon={<Shield className="h-8 w-8 text-indigo-500" />}
                        title="Secure Testing"
                        description="Anti-cheat mechanisms and secure test environment for integrity."
                    />
                    <FeatureCard 
                        icon={<Clock className="h-8 w-8 text-primary-500" />}
                        title="Timed Assessments"
                        description="Customizable timers with auto-submit capabilities for strict schedules."
                    />
                    <FeatureCard 
                        icon={<CheckCircle className="h-8 w-8 text-emerald-500" />}
                        title="Instant Results"
                        description="Immediate feedback, score calculation, and detailed performance history."
                    />
                </div>
            </div>
        </Layout>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left">
        <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

export default Home;
