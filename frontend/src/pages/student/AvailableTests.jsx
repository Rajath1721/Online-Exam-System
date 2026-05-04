import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { FileText, Clock, AlertCircle } from 'lucide-react';

const AvailableTests = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'student') {
            navigate('/login');
            return;
        }

        const fetchAvailable = async () => {
            try {
                const res = await api.get('/student/tests/available');
                setTests(res.data);
            } catch (err) {
                console.error("Failed to fetch available tests", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailable();
    }, [user, navigate]);

    if (loading) return <Layout><div className="text-center py-20">Loading available tests...</div></Layout>;

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Available Tests</h1>
                <p className="text-gray-600 mt-2">Select a test below to begin. Note that once submitted, you cannot retake it.</p>
            </div>

            {tests.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tests currently available</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        You have taken all available exams, or your instructor hasn't published any new ones yet.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tests.map(test => (
                        <div key={test.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                            <div className="mb-4">
                                <span className="text-xs font-semibold tracking-wider uppercase text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                                    {test.subject}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{test.title}</h3>
                            
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center text-sm text-gray-600">
                                    <FileText className="h-4 w-4 mr-2" />
                                    {test.question_count} Questions ({test.marks_per_question} marks/q)
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="h-4 w-4 mr-2" />
                                    {test.timer_minutes > 0 ? `${test.timer_minutes} Minutes` : 'Untimed'}
                                </div>
                            </div>
                            
                            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center text-amber-600 text-xs font-medium">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Single Attempt
                                </div>
                                <Link 
                                    to={`/student/tests/${test.id}/take`}
                                    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors text-sm"
                                >
                                    Start Test
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default AvailableTests;
