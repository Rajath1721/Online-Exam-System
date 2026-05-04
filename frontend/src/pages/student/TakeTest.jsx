import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const TakeTest = () => {
    const { testId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [testData, setTestData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    
    // Timer states
    const [timeLeft, setTimeLeft] = useState(null);

    // Submission handler (wrapped in useCallback for useEffect dependency)
    const submitTest = useCallback(async (autoSubmit = false) => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const res = await api.post(`/student/tests/${testId}/submit`, { answers });
            setResult(res.data);
            if (autoSubmit) {
                alert("Time is up! Your test has been automatically submitted.");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error submitting test.');
        } finally {
            setSubmitting(false);
        }
    }, [answers, testId, submitting]);

    useEffect(() => {
        if (!user || user.role !== 'student') {
            navigate('/login');
            return;
        }

        const fetchTest = async () => {
            try {
                const res = await api.get(`/student/tests/${testId}`);
                setTestData(res.data);
                
                if (res.data.test.timer_minutes > 0) {
                    setTimeLeft(res.data.test.timer_minutes * 60); // Convert to seconds
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load test.');
            } finally {
                setLoading(false);
            }
        };

        fetchTest();
    }, [testId, user, navigate]);

    // Timer Effect
    useEffect(() => {
        if (timeLeft === null || result) return;

        if (timeLeft <= 0) {
            // Auto submit when time hits 0
            submitTest(true);
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, result, submitTest]);

    const handleOptionChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) return <Layout><div className="text-center py-20">Loading your test...</div></Layout>;

    if (error) return (
        <Layout>
            <div className="bg-red-50 text-red-700 p-8 rounded-xl max-w-2xl mx-auto flex flex-col items-center">
                <AlertTriangle className="h-12 w-12 mb-4 text-red-500" />
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/student/dashboard')} className="mt-6 px-6 py-2 bg-white text-red-700 rounded-lg shadow-sm border border-red-200">Return to Dashboard</button>
            </div>
        </Layout>
    );

    // Results View After Submission
    if (result) {
        return (
            <Layout>
                <div className="max-w-3xl mx-auto text-center py-12">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Test Submitted!</h1>
                    <p className="text-lg text-gray-600 mb-8">{result.message}</p>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500 mb-1">Score</p>
                            <p className="text-3xl font-bold text-gray-900">{result.score}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500 mb-1">Percentage</p>
                            <p className={`text-3xl font-bold ${result.percentage >= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {result.percentage}%
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-500 mb-1">Correct Answers</p>
                            <p className="text-3xl font-bold text-gray-900">{result.correct_answers} <span className="text-lg text-gray-400">/ {result.total_questions}</span></p>
                        </div>
                    </div>
                    
                    <button onClick={() => navigate('/student/dashboard')} className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors shadow-sm">
                        Return to Dashboard
                    </button>
                </div>
            </Layout>
        );
    }

    const { test, questions } = testData;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Sticky Header for Test Taking */}
            <header className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{test.title}</h1>
                        <p className="text-sm text-gray-500">{test.subject} • {questions.length} Questions</p>
                    </div>
                    
                    {timeLeft !== null && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg border ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                            <Clock className="h-5 w-5" />
                            {formatTime(timeLeft)}
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8">
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl flex gap-3 text-sm">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <p>Do not refresh this page or navigate away. Submitting the test is final.</p>
                </div>

                <div className="space-y-8">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex gap-4 mb-6">
                                <span className="flex-shrink-0 bg-primary-100 text-primary-700 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                    {idx + 1}
                                </span>
                                <h3 className="text-lg font-medium text-gray-900 mt-1.5">{q.question}</h3>
                            </div>
                            
                            <div className="space-y-3 pl-14">
                                {['A', 'B', 'C', 'D'].map(opt => {
                                    const optionKey = `option_${opt.toLowerCase()}`;
                                    const isSelected = answers[q.id] === opt;
                                    return (
                                        <label 
                                            key={opt}
                                            className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                                        >
                                            <input 
                                                type="radio" 
                                                name={`question_${q.id}`} 
                                                value={opt}
                                                checked={isSelected}
                                                onChange={() => handleOptionChange(q.id, opt)}
                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                            />
                                            <span className="ml-4 font-medium text-gray-700 select-none">
                                                <span className="mr-2 text-gray-400">{opt}.</span>
                                                {q[optionKey]}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex justify-end pb-20">
                    <button 
                        onClick={() => window.confirm("Are you sure you want to completely finish and submit?") && submitTest(false)}
                        disabled={submitting}
                        className={`px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-primary-500/30 transition-all ${submitting ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                    >
                        {submitting ? 'Submitting Test...' : 'Finish & Submit Test'}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default TakeTest;
