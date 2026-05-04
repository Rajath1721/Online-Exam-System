import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Award, UserCircle, Search } from 'lucide-react';

const StudentResults = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }

        const fetchResults = async () => {
            try {
                const res = await api.get('/admin/results');
                setResults(res.data);
            } catch (err) {
                console.error("Failed to fetch results", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [user, navigate]);

    const filteredResults = results.filter(r => 
        r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.test_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.student_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Layout><div className="text-center py-20">Loading results...</div></Layout>;

    return (
        <Layout>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Student Results</h1>
                    <p className="text-gray-600 mt-1">Review performance tracking across all tests.</p>
                </div>
                
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="search"
                        placeholder="Search student or test..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Test Details</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Taken</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredResults.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">No results found matching your search.</td></tr>
                        ) : (
                            filteredResults.map(result => (
                                <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                <UserCircle className="h-6 w-6 text-indigo-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{result.student_name}</div>
                                                <div className="text-sm text-gray-500">{result.student_email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-sm font-medium text-gray-900">{result.test_title}</div>
                                        <div className="text-xs max-w-[200px] truncate text-gray-500 mt-1 bg-gray-100 px-2 py-1 rounded inline-block">
                                            ID: #{result.id}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center">
                                            <Award className={`h-5 w-5 mr-2 ${result.percentage >= 60 ? 'text-emerald-500' : 'text-amber-500'}`} />
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{result.percentage}%</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{result.score} Marks</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-gray-500 whitespace-nowrap">
                                        {new Date(result.date_attempted).toLocaleString(undefined, { 
                                            year: 'numeric', month: 'short', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default StudentResults;
