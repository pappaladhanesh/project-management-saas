import React, { useState, useEffect, useContext } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Plus, X, Trash2, GripVertical, ListTodo, Loader2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import TaskModal from '../components/TaskModal';

const Tasks = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const [tasks, setTasks] = useState({ Todo: [], 'In Progress': [], Completed: [] });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [filters, setFilters] = useState({ search: '', priority: '', project_id: '' });

    const [newTask, setNewTask] = useState({
        title: '', description: '', priority: 'Medium', due_date: '', assigned_to: '', project_id: ''
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTasks();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [filters]);

    useEffect(() => {
        if (user?.role === 'Admin') {
            fetchProjects();
            fetchMembers();
        } else if (user) {
            // Fetch projects to get their IDs for socket joining
            api.get('/projects').then(res => setProjects(Array.isArray(res.data) ? res.data : []));
        }
    }, [user]);

    useEffect(() => {
        if (!socket || projects.length === 0) return;
        
        projects.forEach(p => {
            socket.emit('join_project', p.id);
        });

        const handleTaskUpdate = () => {
            console.log('Real-time update received');
            fetchTasks();
        };

        socket.on('task_updated', handleTaskUpdate);

        return () => {
            socket.off('task_updated', handleTaskUpdate);
        };
    }, [socket, projects]);

    const fetchTasks = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.priority) queryParams.append('priority', filters.priority);
            if (filters.project_id) queryParams.append('project_id', filters.project_id);

            const res = await api.get(`/tasks?${queryParams.toString()}`);
            const grouped = { Todo: [], 'In Progress': [], Completed: [] };
            if (Array.isArray(res.data)) {
                res.data.forEach(task => {
                    if (grouped[task.status]) grouped[task.status].push(task);
                });
            }
            setTasks(grouped);
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error('Failed to fetch projects'); }
    };

    const fetchMembers = async () => {
        try {
            const res = await api.get('/users');
            setMembers(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error('Failed to fetch members'); }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) return toast.error('Task title is required');
        try {
            await api.post('/tasks', {
                ...newTask,
                assigned_to: newTask.assigned_to || null,
                project_id: newTask.project_id || null
            });
            setNewTask({ title: '', description: '', priority: 'Medium', due_date: '', assigned_to: '', project_id: '' });
            setShowForm(false);
            toast.success('Task created!');
            fetchTasks();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            toast.success('Task deleted');
            fetchTasks();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete task');
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;

        if (source.droppableId !== destination.droppableId) {
            const sourceList = [...tasks[source.droppableId]];
            const destList = [...tasks[destination.droppableId]];
            const [movedTask] = sourceList.splice(source.index, 1);

            movedTask.status = destination.droppableId;
            destList.splice(destination.index, 0, movedTask);

            setTasks({ ...tasks, [source.droppableId]: sourceList, [destination.droppableId]: destList });

            try {
                await api.put(`/tasks/${draggableId}`, { status: destination.droppableId });
            } catch (err) {
                toast.error('Failed to update task status');
                fetchTasks();
            }
        }
    };

    const priorityBadge = (priority) => {
        const colors = {
            High: 'text-rose-700 bg-rose-50 border-rose-200',
            Medium: 'text-amber-700 bg-amber-50 border-amber-200',
            Low: 'text-green-700 bg-green-50 border-green-200'
        };
        return colors[priority] || 'text-gray-700 bg-gray-50 border-gray-200';
    };

    const columnColors = {
        'Todo': { header: 'bg-gray-200 text-gray-700', dot: 'bg-gray-400' },
        'In Progress': { header: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
        'Completed': { header: 'bg-green-100 text-green-700', dot: 'bg-green-500' }
    };

    const totalTasks = Object.values(tasks).flat().length;

    if (loading) return (
        <div className="p-6 animate-pulse space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
            <div className="flex flex-col lg:flex-row gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl flex-1 h-96 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                        <div className="space-y-3">
                            {[1, 2].map(j => (
                                <div key={j} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 h-24"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Task Tracking</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag and drop tasks or click to view details.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <input 
                        type="text" 
                        placeholder="Search tasks..." 
                        value={filters.search}
                        onChange={e => setFilters({...filters, search: e.target.value})}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm w-full sm:w-auto"
                    />
                    <select 
                        value={filters.priority}
                        onChange={e => setFilters({...filters, priority: e.target.value})}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                        <option value="">All Priorities</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    {user?.role === 'Admin' && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm"
                        >
                            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {showForm ? 'Cancel' : 'New Task'}
                        </button>
                    )}
                </div>
            </div>

            {/* Create Task Form */}
            {showForm && user?.role === 'Admin' && (
                <form onSubmit={handleCreateTask} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Task</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                            <input type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" rows="2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input type="date" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                            <select value={newTask.assigned_to} onChange={e => setNewTask({...newTask, assigned_to: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                <option value="">Unassigned</option>
                                {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                            <select value={newTask.project_id} onChange={e => setNewTask({...newTask, project_id: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                <option value="">No Project</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
                                Create Task
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Kanban Board */}
            {totalTasks === 0 && !showForm ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
                    <ListTodo className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">No tasks yet</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 max-w-md mx-auto">
                        {user?.role === 'Admin'
                            ? 'Click "New Task" to create your first task and start tracking progress.'
                            : 'No tasks have been assigned to you yet. Check back later!'}
                    </p>
                </div>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4">
                        {Object.entries(tasks).map(([columnId, columnTasks]) => (
                            <div key={columnId} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl min-w-[320px] flex-1 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-2.5 h-2.5 rounded-full ${columnColors[columnId]?.dot}`}></div>
                                    <h2 className="font-bold text-gray-700 dark:text-gray-200">{columnId}</h2>
                                    <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${columnColors[columnId]?.header}`}>
                                        {columnTasks.length}
                                    </span>
                                </div>
                                <Droppable droppableId={columnId}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`min-h-[200px] rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
                                        >
                                            {columnTasks.map((task, index) => (
                                                <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div ref={provided.innerRef} {...provided.draggableProps} onClick={() => setSelectedTask(task)}
                                                             className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-3 hover:shadow-md transition-shadow cursor-pointer ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-200 dark:ring-indigo-500' : ''}`}>
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                                                    <div {...provided.dragHandleProps} onClick={e => e.stopPropagation()} className="mt-0.5 text-gray-300 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400">
                                                                        <GripVertical className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{task.title}</h4>
                                                                        {task.description && (
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {user?.role === 'Admin' && (
                                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                                                        className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${priorityBadge(task.priority)}`}>
                                                                    {task.priority}
                                                                </span>
                                                                {task.due_date && (
                                                                    <span className="text-xs text-gray-400">
                                                                        Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            )}
            
            {selectedTask && (
                <TaskModal 
                    task={selectedTask} 
                    projects={projects}
                    members={members}
                    onClose={() => setSelectedTask(null)} 
                    onUpdate={fetchTasks} 
                />
            )}
        </div>
    );
};

export default Tasks;