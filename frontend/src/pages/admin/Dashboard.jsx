import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { BarChart3, Users, BookOpen, Clock } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }

        const fetchMetrics = async () => {
            try {
                const res = await api.get('/admin/metrics');
                setMetrics(res.data);
            } catch (err) {
                console.error("Failed to fetch metrics", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [user, navigate]);

    if (loading) return <Layout><div className="text-center py-20">Loading dashboard...</div></Layout>;

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back, {user?.name}. Here's an overview of the system.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <MetricCard 
                    title="Total Tests" 
                    value={metrics?.total_tests || 0} 
                    icon={<BookOpen className="h-6 w-6 text-primary-600" />} 
                    color="bg-primary-50"
                />
                <MetricCard 
                    title="Registered Students" 
                    value={metrics?.total_students || 0} 
                    icon={<Users className="h-6 w-6 text-indigo-600" />} 
                    color="bg-indigo-50"
                />
                <MetricCard 
                    title="Average Score" 
                    value={`${metrics?.average_score || 0}%`} 
                    icon={<BarChart3 className="h-6 w-6 text-emerald-600" />} 
                    color="bg-emerald-50"
                />
                <MetricCard 
                    title="Total Attempts" 
                    value={metrics?.total_attempts || 0} 
                    icon={<Clock className="h-6 w-6 text-amber-600" />} 
                    color="bg-amber-50"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link to="/admin/tests" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-sm transition-all group">
                        <div className="bg-primary-50 p-3 rounded-lg group-hover:bg-primary-100 transition-colors mr-4">
                            <BookOpen className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Manage Tests & Questions</h3>
                            <p className="text-sm text-gray-500">Create, edit, or delete exams.</p>
                        </div>
                    </Link>
                    <Link to="/admin/results" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:shadow-sm transition-all group">
                        <div className="bg-emerald-50 p-3 rounded-lg group-hover:bg-emerald-100 transition-colors mr-4">
                            <BarChart3 className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">View Student Results</h3>
                            <p className="text-sm text-gray-500">Analyze performance and scores.</p>
                        </div>
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

const MetricCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className={`${color} p-4 rounded-lg mr-4`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

export default AdminDashboard;
