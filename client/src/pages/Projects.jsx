import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Folder, Trash2, Calendar, Pencil, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const { user } = useContext(AuthContext);
    const [newProject, setNewProject] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => { 
        const delayDebounceFn = setTimeout(() => {
            fetchProjects(); 
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchProjects = async () => {
        try {
            const res = await api.get(`/projects${searchQuery ? `?search=${searchQuery}` : ''}`);
            setProjects(Array.isArray(res.data) ? res.data : []);
        } catch (err) { toast.error('Failed to load projects'); }
        finally { setLoading(false); }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProject.title.trim()) return toast.error('Project title is required');
        setCreating(true);
        try {
            await api.post('/projects', newProject);
            setNewProject({ title: '', description: '' });
            toast.success('Project created successfully!');
            fetchProjects();
        } catch (err) { toast.error(err.response?.data?.error || 'Failed to create project'); }
        finally { setCreating(false); }
    };

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/projects/${editProject.id}`, { title: editProject.title, description: editProject.description });
            toast.success('Project updated!');
            setEditProject(null);
            fetchProjects();
        } catch (err) { toast.error('Failed to update project'); }
    };

    const handleDeleteProject = async () => {
        try {
            await api.delete(`/projects/${deleteConfirm.id}`);
            setProjects(projects.filter(p => p.id !== deleteConfirm.id));
            toast.success('Project deleted');
            setDeleteConfirm(null);
        } catch (err) { toast.error(err.response?.data?.error || 'Failed to delete'); }
    };

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading projects...</p>
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Project Management</h1>
                    <p className="text-sm text-gray-500 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
                </div>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search projects..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 text-sm"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {user?.role === 'Admin' && (
                <form onSubmit={handleCreateProject} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
                    <div className="flex gap-4">
                        <input type="text" placeholder="Project Title" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="flex-1 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" required />
                        <input type="text" placeholder="Description" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="flex-[2] border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" required />
                        <button type="submit" disabled={creating} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm whitespace-nowrap flex items-center gap-2 disabled:opacity-50">
                            {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create
                        </button>
                    </div>
                </form>
            )}

            {projects.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <Folder className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">No projects yet</h3>
                    <p className="text-sm text-gray-400 mt-2">{user?.role === 'Admin' ? 'Create your first project above.' : 'No projects assigned yet.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div 
                            key={project.id} 
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all group cursor-pointer"
                            onClick={() => navigate(`/projects/${project.id}`)}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 rounded-lg bg-indigo-50 flex-shrink-0"><Folder className="w-5 h-5 text-indigo-600" /></div>
                                    <h3 className="text-lg font-bold text-gray-800 truncate">{project.title}</h3>
                                </div>
                                {user?.role === 'Admin' && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); setEditProject({...project}); }} className="p-1.5 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(project); }} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-600 mt-3 text-sm line-clamp-2">{project.description}</p>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full">Active</span>
                                {project.created_at && <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar className="w-3 h-3" />{new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditProject(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Edit Project</h2>
                            <button onClick={() => setEditProject(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleUpdateProject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input type="text" value={editProject.title} onChange={e => setEditProject({...editProject, title: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={editProject.description} onChange={e => setEditProject({...editProject, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" rows="3" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setEditProject(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 text-center" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
                        <h3 className="text-lg font-bold text-gray-900">Delete Project?</h3>
                        <p className="text-sm text-gray-500 mt-2">This will permanently delete "{deleteConfirm.title}" and all its tasks.</p>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                            <button onClick={handleDeleteProject} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;