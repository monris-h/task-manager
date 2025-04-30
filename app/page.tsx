"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";

type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (status === "authenticated") fetchTasks();
  }, [status]);

  async function fetchTasks() {
    const res = await fetch("/api/tasks");
    if (res.ok) setTasks(await res.json());
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, dueDate }),
    });
    if (res.ok) {
      setTitle(""); setDescription(""); setDueDate("");
      const task = await res.json();
      setTasks(prev => [task, ...prev]);
    }
  }

  async function toggleComplete(task: Task) {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, completed: !task.completed }),
    });
    fetchTasks();
  }

  async function handleDelete(id: string) {
    await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="animate-pulse text-purple-600 text-xl">Cargando...</div>
      </div>
    );
  }
  
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center border-t-4 border-purple-600">
          <h1 className="text-2xl font-bold text-purple-800 mb-6">Gestor de Tareas</h1>
          <p className="mb-6 text-gray-600">Necesitas iniciar sesión para acceder a tus tareas</p>
          <Link 
            href="/auth/signin" 
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-purple-700">Task Manager</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Hola, {session?.user?.name}</span>
              <button 
                onClick={() => signOut()} 
                className="text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-full transition-colors duration-200"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 hover:shadow-lg transition-shadow duration-300 border border-purple-100">
          <div className="bg-purple-600 h-2 w-full"></div>
          <div className="p-6">
            <h2 className="text-xl font-medium text-purple-800 mb-4">Nueva tarea</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="¿Qué necesitas hacer?"
                  aria-label="Título de la tarea"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 p-2 rounded-lg transition-all"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Descripción (opcional)"
                  aria-label="Descripción de la tarea"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 p-2 rounded-lg transition-all"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Fecha de vencimiento</label>
                <input
                  type="date"
                  aria-label="Fecha de vencimiento"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 p-2 rounded-lg transition-all"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                <span>Crear tarea</span>
              </button>
            </form>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-purple-800 mb-4 pl-2 border-l-4 border-purple-500">
            Mis tareas
          </h2>
          
          {tasks.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-dashed border-gray-300">
              <p className="text-gray-500">No hay tareas pendientes</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 overflow-hidden
                    ${task.completed ? 'border-l-4 border-green-500' : 'border-l-4 border-purple-500'}`}
                >
                  <div className="p-5">
                    <div className="flex justify-between">
                      <h3 className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {task.title}
                      </h3>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => toggleComplete(task)} 
                          className={`h-6 w-6 rounded-full flex items-center justify-center
                            ${task.completed 
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' 
                              : 'bg-purple-100 hover:bg-purple-200 text-purple-700'}`}
                        >
                          {task.completed ? '↺' : '✓'}
                        </button>
                        <button 
                          onClick={() => handleDelete(task.id)} 
                          className="h-6 w-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className={`text-sm mt-2 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {task.description}
                      </p>
                    )}
                    
                    {task.dueDate && (
                      <div className="flex items-center mt-3">
                        <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
