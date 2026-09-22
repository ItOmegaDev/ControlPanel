import React, { useState } from 'react';
import {
  Layers,
  RotateCw,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  AlertOctagon,
  Play,
  RotateCcw,
  Trash2,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QueueJob } from '../../types';

export const HorizonQueues: React.FC = () => {
  const { queueJobs, retryJob, t } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeJobDetails, setActiveJobDetails] = useState<QueueJob | null>(null);

  const filteredJobs = queueJobs.filter((j) => {
    if (selectedStatus === 'all') return true;
    return j.status === selectedStatus;
  });

  const runningCount = queueJobs.filter((j) => j.status === 'processing').length;
  const pendingCount = queueJobs.filter((j) => j.status === 'queued').length;
  const failedCount = queueJobs.filter((j) => j.status === 'failed').length;
  const completedCount = queueJobs.filter((j) => j.status === 'completed').length;

  const handleRetryAll = () => {
    queueJobs.filter((j) => j.status === 'failed').forEach((j) => retryJob(j.id));
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-purple-400" />
            <span>{t.nav_horizon}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Redis Queue Engine
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Асинхронний бекенд для важких завдань (міграції, бекапи, SteamCMD) з прогрес-барами замість
            блокування UI
          </p>
        </div>

        {failedCount > 0 && (
          <button
            onClick={handleRetryAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Перезапустити всі помилки ({failedCount})</span>
          </button>
        )}
      </div>

      {/* Horizon Metrics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>В обробці (Processing)</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div className="text-2xl font-black text-cyan-400">{runningCount}</div>
          <div className="text-[10px] text-slate-500">12 активних воркерів Horizon</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>В очікуванні (Pending)</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{pendingCount}</div>
          <div className="text-[10px] text-slate-500">Час очікування: &lt; 0.2s</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Завершено (Completed)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{completedCount}</div>
          <div className="text-[10px] text-slate-500">Throughput: ~48 jobs/min</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Помилки (Failed)</span>
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{failedCount}</div>
          <div className="text-[10px] text-slate-500">Auto-retry exponential backoff</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {(['all', 'processing', 'pending', 'completed', 'failed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              selectedStatus === status
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {status === 'all'
              ? 'Усі задачі'
              : status === 'processing'
              ? 'В обробці'
              : status === 'pending'
              ? 'В черзі'
              : status === 'completed'
              ? 'Успішні'
              : 'Помилки'}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 uppercase">
            <tr>
              <th className="p-3.5">Статус</th>
              <th className="p-3.5">Черга & Завдання</th>
              <th className="p-3.5">Прогрес</th>
              <th className="p-3.5">Тривалість</th>
              <th className="p-3.5">Спроби</th>
              <th className="p-3.5 text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredJobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                {/* Status */}
                <td className="p-3.5">
                  {job.status === 'processing' ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 w-fit">
                      <RotateCw className="w-2.5 h-2.5 animate-spin" />
                      Обробка
                    </span>
                  ) : job.status === 'completed' ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 w-fit">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Завершено
                    </span>
                  ) : job.status === 'failed' ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30 w-fit">
                      <XCircle className="w-2.5 h-2.5" />
                      Помилка
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 border border-slate-700 w-fit">
                      <Clock className="w-2.5 h-2.5" />
                      В черзі
                    </span>
                  )}
                </td>

                {/* Job Name */}
                <td className="p-3.5 font-sans">
                  <div className="font-bold text-white text-xs">{job.title}</div>
                  <div className="text-[11px] font-mono text-purple-400 mt-0.5">
                    Type: {job.type} • ID: {job.id}
                  </div>
                </td>

                {/* Progress bar */}
                <td className="p-3.5 w-48">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{job.progress}%</span>
                      {job.status === 'processing' && <span className="animate-pulse">Live</span>}
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          job.status === 'completed'
                            ? 'bg-emerald-500'
                            : job.status === 'failed'
                            ? 'bg-rose-500'
                            : 'bg-cyan-500'
                        }`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Runtime */}
                <td className="p-3.5 text-slate-400">
                  {job.duration_seconds ? `${job.duration_seconds}s` : 'в процесі'}
                </td>

                {/* Status message */}
                <td className="p-3.5 text-slate-300 text-xs truncate max-w-xs font-mono">
                  {job.current_step}
                </td>

                {/* Action buttons */}
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {job.status === 'failed' && (
                      <>
                        <button
                          onClick={() => setActiveJobDetails(job)}
                          className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-[11px] font-semibold"
                        >
                          Stack trace
                        </button>
                        <button
                          onClick={() => retryJob(job.id)}
                          className="p-1 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black"
                          title="Повторити задачу"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stack Trace Modal */}
      {activeJobDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" />
                <span>Деталі помилки Horizon Job: {activeJobDetails.title}</span>
              </h3>
              <button
                onClick={() => setActiveJobDetails(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Закрити
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="text-slate-400">Останній стан перед збоєм:</div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-rose-300">
                {activeJobDetails.current_step}
              </div>

              <div className="text-slate-400 pt-2">Stack Trace (Worker #04):</div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-[11px] leading-relaxed max-h-48 overflow-y-auto">
                at App\Jobs\CreateServerBackupJob-&gt;handle(CreateServerBackupJob.php:72)
                <br />
                at Illuminate\Queue\CallQueuedHandler-&gt;call(CallQueuedHandler.php:123)
                <br />
                at Illuminate\Queue\Jobs\RedisJob-&gt;fire(RedisJob.php:98)
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  retryJob(activeJobDetails.id);
                  setActiveJobDetails(null);
                }}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400"
              >
                Повторити зараз (Retry)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
