import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDiscussionContext } from '../../contexts/DiscussionContext';
import Button from '../shared/Button';
import Card from '../shared/Card';

interface Task {
  id: string;
  title: string;
  milestone: string;
  owner: string;
  status: 'todo' | 'in-progress' | 'done';
}

const DEMO_TASKS: Task[] = [
  { id: 't1', title: 'Conduct 10 customer interviews', milestone: 'Validation', owner: 'Founder', status: 'todo' },
  { id: 't2', title: 'Analyze 5 key competitors', milestone: 'Validation', owner: 'Founder', status: 'todo' },
  { id: 't3', title: 'Define value proposition', milestone: 'Validation', owner: 'Advisor', status: 'todo' },
  { id: 't4', title: 'Create wireframes', milestone: 'MVP Design', owner: 'Designer', status: 'todo' },
  { id: 't5', title: 'Choose tech stack', milestone: 'MVP Design', owner: 'CTO', status: 'todo' },
  { id: 't6', title: 'Set up development environment', milestone: 'MVP Build', owner: 'Developer', status: 'todo' },
  { id: 't7', title: 'Build core features', milestone: 'MVP Build', owner: 'Developer', status: 'todo' },
  { id: 't8', title: 'Landing page + signup', milestone: 'Beta Launch', owner: 'Marketing', status: 'todo' },
];

export default function LaunchPad() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useDiscussionContext();
  const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS);

  const columns = ['todo', 'in-progress', 'done'] as const;
  const columnLabels = { todo: 'לביצוע', 'in-progress': 'בתהליך', done: 'הושלם' };
  const columnColors = { todo: 'border-gray-600', 'in-progress': 'border-amber-500', done: 'border-green-500' };

  function moveTask(taskId: string, newStatus: Task['status']) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  }

  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => navigate(`/plan/${id}`)} className="text-gray-500 hover:text-white text-sm mb-2 inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              חזרה לתוכנית
            </button>
            <h1 className="text-3xl font-bold">LaunchPad — מרכז פיקוד</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/office/${id}`)}>
              חזרה למועצה
            </Button>
            <Button size="sm" variant="secondary">הורד תוכנית (PDF)</Button>
          </div>
        </div>

        {/* Progress Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-xs text-gray-500 mb-1">התקדמות כללית</div>
            <div className="text-2xl font-bold text-indigo-400">{progressPercent}%</div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
              <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </Card>
          <Card>
            <div className="text-xs text-gray-500 mb-1">משימות</div>
            <div className="text-2xl font-bold text-white">{completedCount}/{tasks.length}</div>
          </Card>
          <Card>
            <div className="text-xs text-gray-500 mb-1">שלב נוכחי</div>
            <div className="text-lg font-bold text-amber-400">Validation</div>
          </Card>
          <Card>
            <div className="text-xs text-gray-500 mb-1">צוות</div>
            <div className="text-lg font-bold text-green-400">2/4 מאוישים</div>
          </Card>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-3 gap-4">
          {columns.map((col) => (
            <div key={col}>
              <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${columnColors[col]}`}>
                <h3 className="font-bold text-sm">{columnLabels[col]}</h3>
                <span className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">
                  {tasks.filter((t) => t.status === col).length}
                </span>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {tasks
                  .filter((t) => t.status === col)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 group hover:border-gray-600 transition-colors"
                    >
                      <div className="text-sm text-gray-200 mb-2">{task.title}</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded">{task.milestone}</span>
                          <span className="text-[10px] text-gray-600">{task.owner}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {col !== 'todo' && (
                            <button
                              onClick={() => moveTask(task.id, col === 'done' ? 'in-progress' : 'todo')}
                              className="text-[10px] bg-gray-700 hover:bg-gray-600 px-1.5 py-0.5 rounded text-gray-400"
                            >
                              ←
                            </button>
                          )}
                          {col !== 'done' && (
                            <button
                              onClick={() => moveTask(task.id, col === 'todo' ? 'in-progress' : 'done')}
                              className="text-[10px] bg-gray-700 hover:bg-gray-600 px-1.5 py-0.5 rounded text-gray-400"
                            >
                              →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
