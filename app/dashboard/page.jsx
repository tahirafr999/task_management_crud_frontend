'use client'

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', description: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const router = useRouter();

    // Check for token in localStorage and redirect if not authenticated
    if (typeof window !== "undefined" && !localStorage.getItem('token')) {
        router.push('/login');
    }

    // Fetch tasks from the backend
    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://task-management-crud-backend-node.vercel.app/api/tasks', {
                headers: { Authorization: `Bearer ${token}` }, // Updated header
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('Failed to load tasks.');
        }
    };

    useEffect(() => {
        fetchTasks(); // Fetch tasks on component mount
    }, []);

    const createTask = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('https://task-management-crud-backend-node.vercel.app/api/tasks', newTask, {
                headers: { Authorization: `Bearer ${token}` }, // Updated header
            });
            setTasks([...tasks, response.data]);
            setNewTask({ title: '', description: '' });
            toast.success('Task created successfully!');
        } catch (error) {
            console.error('Error creating task:', error);
            toast.error('Failed to create task.');
        }
    };

    // Delete task
    const deleteTask = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`https://task-management-crud-backend-node.vercel.app/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }, // Updated header
            });
            setTasks(tasks.filter((task) => task.id !== taskId));
            toast.success('Task deleted successfully!');
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task.');
        }
    };

    // Edit task
    const editTask = (task) => {
        setIsEditing(true);
        setEditingTask(task);
        setNewTask({ title: task.title, description: task.description });
    };

    // Update task
    const updateTask = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `https://task-management-crud-backend-node.vercel.app/api/tasks/${editingTask.id}`,
                newTask,
                {
                    headers: { Authorization: `Bearer ${token}` }, // Updated header
                }
            );

            // Option 1: Re-fetch tasks after update
            fetchTasks();

            // Option 2: Directly update the task in the state
            // setTasks(tasks.map((task) => (task.id === editingTask.id ? response.data : task)));

            setIsEditing(false);
            setEditingTask(null);
            setNewTask({ title: '', description: '' });
            toast.success('Task updated successfully!');
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Failed to update task.');
        }
    };

    return (
        <>
            {/* Sidebar and other layout components here */}
            <aside id="default-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
                <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <svg className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                                </svg>
                                <span className="ms-3">Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <button className='bg-red-600 cursor-pointer w-full py-2' onClick={() => {
                                localStorage.removeItem('token')
                                router.push('/login')
                            }}>
                                Sign out
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>
            <div className="p-4 sm:ml-64">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">
                    {/* Task Form */}
                    <form onSubmit={isEditing ? updateTask : createTask} className="mb-4">
                        <div className="mb-2">
                            <input
                                type="text"
                                className="p-2 border rounded"
                                placeholder="Task Title"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-2">
                            <input
                                type="text"
                                className="p-2 border rounded"
                                placeholder="Task Description"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white p-2 rounded"
                        >
                            {isEditing ? 'Update Task' : 'Create Task'}
                        </button>
                    </form>

                    {/* Task List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tasks.map((task) => (
                            <div key={task.id} className="p-4 border rounded shadow-lg">
                                <h3 className="text-xl font-bold">{task.title}</h3>
                                <p>{task.description}</p>
                                <div className="mt-2 flex justify-between">
                                    <button
                                        onClick={() => editTask(task)}
                                        className="text-yellow-500 hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="text-red-500 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
