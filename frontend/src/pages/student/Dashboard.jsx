import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { BookOpen, CheckCircle, Award, Clock } from 'lucide-react';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'student') {
            navigate('/login');
            return;
        }

        const fetchResults = async () => {
            try {
                const res = await api.get('/student/results');
                setResults(res.data);
            } catch (err) {
                console.error("Failed to fetch results", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [user, navigate]);

    if (loading) return <Layout><div className="text-center py-20">Loading dashboard...</div></Layout>;

    // Calculate stats
    const totalTaken = results.length;
    let avgScore = 0;
    let passed = 0;
    
    if (totalTaken > 0) {
        const sum = results.reduce((acc, curr) => acc + parseFloat(curr.percentage), 0);
        avgScore = (sum / totalTaken).toFixed(1);
        passed = results.filter(r => r.percentage >= 60).length; // assuming 60 is pass
    }

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back, {user?.name}. Here is an overview of your progress.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <MetricCard 
                    title="Tests Taken" 
                    value={totalTaken} 
                    icon={<BookOpen className="h-6 w-6 text-primary-600" />} 
                    color="bg-primary-50"
                />
                <MetricCard 
                    title="Average Score" 
                    value={`${avgScore}%`} 
                    icon={<Award className="h-6 w-6 text-indigo-600" />} 
                    color="bg-indigo-50"
                />
                <MetricCard 
                    title="Tests Passed" 
                    value={passed} 
                    icon={<CheckCircle className="h-6 w-6 text-emerald-600" />} 
                    color="bg-emerald-50"
                />
                <MetricCard 
                    title="Recent Activity" 
                    value={totalTaken > 0 ? new Date(results[0].date_attempted).toLocaleDateString() : 'None'} 
                    icon={<Clock className="h-6 w-6 text-amber-600" />} 
                    color="bg-amber-50"
                    textClass="text-lg"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 gap-4">
                        <Link to="/student/available-tests" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-sm transition-all group">
                            <div className="bg-primary-50 p-3 rounded-lg group-hover:bg-primary-100 transition-colors mr-4">
                                <BookOpen className="h-6 w-6 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Take a Test</h3>
                                <p className="text-sm text-gray-500">View available exams and start assessing.</p>
                            </div>
                        </Link>
                        <Link to="/student/results" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:shadow-sm transition-all group">
                            <div className="bg-emerald-50 p-3 rounded-lg group-hover:bg-emerald-100 transition-colors mr-4">
                                <Award className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">View My Results</h3>
                                <p className="text-sm text-gray-500">Check your past test scores and history.</p>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Recent Results</h2>
                    </div>
                    <div className="p-0">
                        {results.length === 0 ? (
                            <p className="p-6 text-gray-500 text-sm">You haven't taken any tests yet.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {results.slice(0, 3).map(res => (
                                    <li key={res.id} className="p-6 flex justify-between items-center hover:bg-gray-50">
                                        <div>
                                            <p className="font-medium text-gray-900">{res.test_title}</p>
                                            <p className="text-sm text-gray-500">{new Date(res.date_attempted).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${res.percentage >= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {res.percentage}%
                                            </p>
                                            <p className="text-sm text-gray-500">{res.score} marks</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {results.length > 3 && (
                            <div className="p-4 border-t border-gray-100 text-center bg-gray-50">
                                <Link to="/student/results" className="text-sm font-medium text-primary-600 hover:text-primary-700">View All Results</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const MetricCard = ({ title, value, icon, color, textClass="text-2xl" }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
        <div className={`${color} p-4 rounded-lg mr-4`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className={`${textClass} font-bold text-gray-900`}>{value}</p>
        </div>
    </div>
);

export default StudentDashboard;
