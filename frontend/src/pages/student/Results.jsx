import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Award, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

const StudentResults = () => {
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

    if (loading) return <Layout><div className="text-center py-20">Loading your history...</div></Layout>;

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Results</h1>
                <p className="text-gray-600 mt-2">View your past test scores, percentages, and attempt history.</p>
            </div>

            {results.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                        You haven't completed any exams. Take a test to see your performance here.
                    </p>
                    <Link to="/student/available-tests" className="text-primary-600 font-medium hover:text-primary-700">Browse Available Tests &rarr;</Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {results.map(result => {
                        const isPass = result.percentage >= 60;
                        return (
                            <div key={result.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-md transition-shadow">
                                <div className="mb-4 sm:mb-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg flex-shrink-0 ${isPass ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {isPass ? <CheckCircle className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{result.test_title}</h3>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <FileText className="h-3.5 w-3.5 mr-1" />
                                                <span className="capitalize">{result.subject}</span>
                                                <span className="mx-2">•</span>
                                                <span>{new Date(result.date_attempted).toLocaleDateString()} at {new Date(result.date_attempted).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6 pl-14 sm:pl-0">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Score</p>
                                        <p className="text-xl font-bold text-gray-900">{result.score}</p>
                                    </div>
                                    <div className="w-px h-10 bg-gray-200"></div>
                                    <div className="text-right min-w-[80px]">
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Percentage</p>
                                        <p className={`text-2xl font-black ${isPass ? 'text-emerald-600' : 'text-amber-500'}`}>
                                            {result.percentage}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </Layout>
    );
};

export default StudentResults;
