import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Plus, Edit2, Trash2, List } from 'lucide-react';

const ManageTests = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', subject: '', marks_per_question: 1, timer_minutes: 0 });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchTests();
    }, [user, navigate]);

    const fetchTests = async () => {
        try {
            const res = await api.get('/admin/tests');
            setTests(res.data);
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
            if (editingId) {
                await api.put(`/admin/tests/${editingId}`, formData);
            } else {
                await api.post('/admin/tests', formData);
            }
            setShowForm(false);
            setFormData({ title: '', subject: '', marks_per_question: 1, timer_minutes: 0 });
            setEditingId(null);
            fetchTests();
        } catch (err) {
            console.error(err);
            alert("Error saving test");
        }
    };

    const handleEdit = (test) => {
        setFormData({
            title: test.title,
            subject: test.subject,
            marks_per_question: test.marks_per_question,
            timer_minutes: test.timer_minutes
        });
        setEditingId(test.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this test? This will delete all associated questions and results.')) {
            try {
                await api.delete(`/admin/tests/${id}`);
                fetchTests();
            } catch (err) {
                console.error(err);
                alert("Error deleting test");
            }
        }
    };

    if (loading) return <Layout><div className="text-center py-20">Loading tests...</div></Layout>;

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Tests</h1>
                    <p className="text-gray-600 mt-1">Create, edit, or remove tests in the system.</p>
                </div>
                <button 
                    onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ title: '', subject: '', marks_per_question: 1, timer_minutes: 0 }); }}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Create New Test
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Test' : 'Create New Test'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                            <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. Midterm Programming Exam" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input required type="text" name="subject" value={formData.subject} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. Computer Science" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Marks per Question</label>
                            <input required type="number" min="1" name="marks_per_question" value={formData.marks_per_question} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Timer (in minutes, 0 for unlimited)</label>
                            <input required type="number" min="0" name="timer_minutes" value={formData.timer_minutes} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">{editingId ? 'Update Test' : 'Save Test'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Info</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Settings</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tests.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">No tests created yet.</td></tr>
                        ) : (
                            tests.map(test => (
                                <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{test.title}</div>
                                        <div className="text-sm text-gray-500">{test.subject}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{test.marks_per_question} marks / q</div>
                                        <div className="text-sm text-gray-500">{test.timer_minutes > 0 ? `${test.timer_minutes} mins` : 'No Timer'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(test.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-3">
                                            <Link to={`/admin/tests/${test.id}/questions`} title="Manage Questions" className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-lg">
                                                <List className="h-4 w-4" />
                                            </Link>
                                            <button onClick={() => handleEdit(test)} title="Edit Test" className="text-primary-600 hover:text-primary-900 bg-primary-50 p-2 rounded-lg">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(test.id)} title="Delete Test" className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
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

export default ManageTests;
