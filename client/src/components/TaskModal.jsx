import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { X, MessageSquare, Activity, Save, Loader2, Send, Paperclip, File, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TaskModal = ({ task, projects, members, onClose, onUpdate }) => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('details'); // details, comments, activity
    const [editData, setEditData] = useState({ ...task });
    const [saving, setSaving] = useState(false);
    
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [logs, setLogs] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    
    useEffect(() => {
        if (activeTab === 'comments') fetchComments();
        if (activeTab === 'activity') fetchLogs();
        if (activeTab === 'attachments') fetchAttachments();
    }, [activeTab]);

    const fetchComments = async () => {
        try {
            const res = await api.get(`/tasks/${task.id}/comments`);
            setComments(res.data);
        } catch (err) { console.error('Failed to fetch comments'); }
    };

    const fetchLogs = async () => {
        try {
            const res = await api.get(`/tasks/${task.id}/logs`);
            setLogs(res.data);
        } catch (err) { console.error('Failed to fetch logs'); }
    };

    const fetchAttachments = async () => {
        try {
            const res = await api.get(`/tasks/${task.id}/attachments`);
            setAttachments(res.data);
        } catch (err) { console.error('Failed to fetch attachments'); }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await api.post(`/tasks/${task.id}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('File uploaded');
            fetchAttachments();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to upload file');
        } finally {
            setUploading(false);
            e.target.value = null; // reset input
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (!window.confirm('Delete this attachment?')) return;
        try {
            await api.delete(`/tasks/attachments/${attachmentId}`);
            toast.success('Attachment deleted');
            fetchAttachments();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete attachment');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/tasks/${task.id}`, editData);
            toast.success('Task updated');
            onUpdate();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update task');
        } finally {
            setSaving(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await api.post(`/tasks/${task.id}/comments`, { content: newComment });
            setNewComment('');
            fetchComments();
            toast.success('Comment added');
        } catch (err) {
            toast.error('Failed to add comment');
        }
    };

    const canEdit = user?.role === 'Admin' || user?.id === task.assigned_to || user?.id === task.created_by;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 truncate pr-4">{task.title}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6">
                    <button onClick={() => setActiveTab('details')} className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Details</button>
                    <button onClick={() => setActiveTab('attachments')} className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'attachments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <Paperclip className="w-4 h-4" /> Attachments
                    </button>
                    <button onClick={() => setActiveTab('comments')} className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'comments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <MessageSquare className="w-4 h-4" /> Comments
                    </button>
                    <button onClick={() => setActiveTab('activity')} className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'activity' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <Activity className="w-4 h-4" /> Activity
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    
                    {activeTab === 'details' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input type="text" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} disabled={!canEdit}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} disabled={!canEdit} rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})} disabled={!canEdit}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100">
                                        <option value="Todo">Todo</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select value={editData.priority} onChange={e => setEditData({...editData, priority: e.target.value})} disabled={!canEdit}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input type="date" value={editData.due_date ? editData.due_date.split('T')[0] : ''} onChange={e => setEditData({...editData, due_date: e.target.value})} disabled={!canEdit}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                                    <select value={editData.assigned_to || ''} onChange={e => setEditData({...editData, assigned_to: e.target.value})} disabled={!canEdit}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100">
                                        <option value="">Unassigned</option>
                                        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'attachments' && (
                        <div className="space-y-6">
                            {/* Upload Area */}
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                                <input 
                                    type="file" 
                                    id="file-upload" 
                                    className="hidden" 
                                    onChange={handleUpload}
                                    disabled={uploading}
                                />
                                <label htmlFor="file-upload" className={`cursor-pointer flex flex-col items-center justify-center ${uploading ? 'opacity-50' : ''}`}>
                                    {uploading ? (
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                                    ) : (
                                        <Paperclip className="w-8 h-8 text-gray-400 mb-2" />
                                    )}
                                    <span className="text-sm font-medium text-indigo-600">
                                        {uploading ? 'Uploading...' : 'Click to upload a file'}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">Images, PDFs, and Documents up to 10MB</span>
                                </label>
                            </div>

                            {/* Attachments List */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-gray-900">Uploaded Files</h3>
                                {attachments.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No attachments yet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {attachments.map(file => (
                                            <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 flex-shrink-0">
                                                    <File className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <a href={file.file_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gray-800 hover:text-indigo-600 truncate block transition-colors">
                                                        {file.file_name}
                                                    </a>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-400">by {file.uploader_name}</span>
                                                        <span className="text-xs text-gray-300">•</span>
                                                        <span className="text-xs text-gray-400">{new Date(file.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <a href={file.file_url} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Download/View">
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                    {(user?.role === 'Admin' || user?.id === file.user_id) && (
                                                        <button onClick={() => handleDeleteAttachment(file.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'comments' && (
                        <div className="flex flex-col h-full space-y-4">
                            <div className="flex-1 space-y-4 overflow-y-auto">
                                {comments.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8 text-sm">No comments yet.</p>
                                ) : (
                                    comments.map(c => (
                                        <div key={c.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-sm text-gray-800">{c.user_name}</span>
                                                <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                                            </div>
                                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{c.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-gray-200">
                                <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..."
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                                <button type="submit" disabled={!newComment.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="space-y-4">
                            {logs.length === 0 ? (
                                <p className="text-gray-500 text-center py-8 text-sm">No activity recorded.</p>
                            ) : (
                                <div className="relative border-l border-gray-200 ml-3 space-y-4">
                                    {logs.map(log => (
                                        <div key={log.id} className="relative pl-6">
                                            <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[6.5px] top-1.5 border-2 border-white"></div>
                                            <p className="text-sm text-gray-800">
                                                <span className="font-semibold">{log.user_name}</span> updated <span className="font-medium text-indigo-600">{log.action_type.replace('_', ' ')}</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                From <span className="italic">'{log.old_value || 'None'}'</span> to <span className="font-medium text-gray-700">'{log.new_value || 'None'}'</span>
                                            </p>
                                            <span className="text-xs text-gray-400 mt-1 block">{new Date(log.created_at).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Footer (only for Details tab) */}
                {activeTab === 'details' && canEdit && (
                    <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskModal;
