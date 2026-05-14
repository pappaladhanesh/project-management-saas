import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Users, Loader2, UserPlus, UserMinus, UserCircle, Briefcase, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [addingMember, setAddingMember] = useState(false);

    useEffect(() => {
        fetchProjectDetails();
        if (user?.role === 'Admin') {
            fetchAllUsers();
        }
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            const res = await api.get(`/projects/${id}`);
            setProject(res.data);
        } catch (err) {
            toast.error('Failed to load project details');
            navigate('/projects');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const res = await api.get('/users');
            setAllUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to load users');
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        
        setAddingMember(true);
        try {
            await api.post('/projects/members', { projectId: id, userId: selectedUser });
            toast.success('Member added successfully');
            setSelectedUser('');
            fetchProjectDetails();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add member');
        } finally {
            setAddingMember(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm('Remove this member?')) return;
        
        try {
            await api.delete(`/projects/${id}/members/${userId}`);
            toast.success('Member removed');
            fetchProjectDetails();
        } catch (err) {
            toast.error('Failed to remove member');
        }
    };

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-gray-500 font-medium">Loading project details...</p>
            </div>
        </div>
    );

    if (!project) return null;

    // Filter out users who are already members
    const availableUsers = allUsers.filter(u => !project.members?.some(m => m.id === u.id));

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate('/projects')}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                    <p className="text-gray-500 mt-1">{project.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Tasks Preview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-indigo-600" />
                                Project Tasks
                            </h2>
                            <span className="bg-indigo-50 text-indigo-700 py-1 px-3 rounded-full text-sm font-semibold">
                                {project.tasks?.length || 0} Total
                            </span>
                        </div>

                        {project.tasks?.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No tasks created yet for this project.</p>
                        ) : (
                            <div className="space-y-3">
                                {project.tasks?.slice(0, 5).map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            {task.status === 'Completed' ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-amber-500" />
                                            )}
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{task.title}</h4>
                                                <p className="text-xs text-gray-500">{task.assigned_to_name || 'Unassigned'}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            task.priority === 'High' ? 'bg-red-100 text-red-700' :
                                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button 
                            onClick={() => navigate('/tasks')}
                            className="w-full mt-4 py-2 text-center text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                            View All Tasks
                        </button>
                    </div>
                </div>

                {/* Right Column: Team Members */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" />
                                Team
                            </h2>
                            <span className="bg-gray-100 text-gray-700 py-1 px-3 rounded-full text-sm font-semibold">
                                {project.members?.length || 0}
                            </span>
                        </div>

                        <div className="space-y-3 mb-6">
                            {project.members?.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                            <p className="text-xs text-gray-500">{member.role}</p>
                                        </div>
                                    </div>
                                    {user?.role === 'Admin' && (
                                        <button 
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove member"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {user?.role === 'Admin' && (
                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Add Member</h3>
                                <form onSubmit={handleAddMember} className="flex gap-2">
                                    <select 
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select user...</option>
                                        {availableUsers.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                    <button 
                                        type="submit" 
                                        disabled={addingMember || !selectedUser}
                                        className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        {addingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProjectDetails;
