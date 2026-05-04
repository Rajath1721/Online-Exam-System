import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const ManageQuestions = () => {
    const { testId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [questions, setQuestions] = useState([]);
    const [testInfo, setTestInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({
        question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A'
    });

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        
        fetchTestData();
    }, [testId, user, navigate]);

    const fetchTestData = async () => {
        try {
            // Fetch test details for header
            const testsRes = await api.get('/admin/tests');
            const currentTest = testsRes.data.find(t => t.id === parseInt(testId));
            setTestInfo(currentTest);

            if (currentTest) {
                const qRes = await api.get(`/admin/tests/${testId}/questions`);
                setQuestions(qRes.data);
            } else {
                navigate('/admin/tests');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/admin/tests/${testId}/questions`, formData);
            setShowForm(false);
            setFormData({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A' });
            fetchTestData();
        } catch (err) {
            console.error(err);
            alert("Error adding question");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this question?")) {
            try {
                await api.delete(`/admin/questions/${id}`);
                fetchTestData();
            } catch (err) {
                console.error(err);
                alert("Error deleting question");
            }
        }
    };

    if (loading) return <Layout><div className="text-center py-20">Loading questions...</div></Layout>;

    return (
        <Layout>
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin/tests" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Questions</h1>
                        <p className="text-gray-600 mt-1">Test: <span className="font-semibold text-primary-700">{testInfo?.title}</span></p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Add Question
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 max-w-3xl">
                    <h2 className="text-xl font-bold mb-4">Add New Question</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                            <textarea required name="question" rows="3" value={formData.question} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500" placeholder="What is React?"></textarea>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Option A</label>
                                <input required type="text" name="option_a" value={formData.option_a} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Option B</label>
                                <input required type="text" name="option_b" value={formData.option_b} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Option C</label>
                                <input required type="text" name="option_c" value={formData.option_c} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Option D</label>
                                <input required type="text" name="option_d" value={formData.option_d} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                            <select name="correct_answer" value={formData.correct_answer} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white">
                                <option value="A">Option A</option>
                                <option value="B">Option B</option>
                                <option value="C">Option C</option>
                                <option value="D">Option D</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Add Question</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {questions.length === 0 ? (
                    <div className="bg-white p-10 text-center rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 font-medium">No questions added to this test yet.</p>
                        <button onClick={() => setShowForm(true)} className="mt-4 text-primary-600 hover:text-primary-700 font-medium">Add the first question</button>
                    </div>
                ) : (
                    questions.map((q, idx) => (
                        <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <span className="flex-shrink-0 bg-primary-100 text-primary-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                        Q{idx + 1}
                                    </span>
                                    <h3 className="text-lg font-medium text-gray-900 mt-1">{q.question}</h3>
                                </div>
                                <button onClick={() => handleDelete(q.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-11">
                                {['A', 'B', 'C', 'D'].map(opt => (
                                    <div 
                                        key={opt} 
                                        className={`p-3 rounded-lg border text-sm flex gap-3 ${q.correct_answer === opt ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-medium ring-1 ring-emerald-500' : 'border-gray-200 bg-gray-50 text-gray-700'}`}
                                    >
                                        <span className={`font-bold ${q.correct_answer === opt ? 'text-emerald-700' : 'text-gray-500'}`}>{opt}.</span>
                                        {q[`option_${opt.toLowerCase()}`]}
                                        
                                        {q.correct_answer === opt && (
                                            <span className="ml-auto flex items-center text-emerald-600 text-xs uppercase tracking-wider font-bold">
                                                Correct
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Layout>
    );
};

export default ManageQuestions;
