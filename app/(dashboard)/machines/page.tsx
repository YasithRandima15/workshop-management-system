'use client';

import React, { useState, useEffect } from 'react';
import { Machine, MachineStatus } from '@/types/machine';
import { MachinesService } from '@/lib/services/machines.service';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils/formatters';
import { Cpu, Printer, Wrench, Play, Square, Plus, Trash2 } from 'lucide-react';
import { MachineModal } from '@/components/machines/MachineModal';

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadMachines = async () => {
    const list = await MachinesService.listMachines();
    setMachines(list);
  };

  useEffect(() => {
    loadMachines();
  }, []);

  const handleStatusChange = async (id: string, status: MachineStatus) => {
    await MachinesService.updateMachineStatus(id, status);
    loadMachines();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await MachinesService.deleteMachine(id);
      loadMachines();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Workshop Machine Fleet & Maintenance
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Monitor real-time status of 3D printers, CNC routers, operating hours, and service schedules.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add New Machine
        </Button>
      </div>

      {/* Machine Cards Grid */}
      {machines.length === 0 ? (
        <div className="p-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg text-center space-y-3">
          <Cpu className="h-8 w-8 text-zinc-400 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No Machines Registered</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Add 3D printers, SLA equipment, or CNC milling machinery to track workshop equipment.
          </p>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            Add First Machine
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {machines.map((mac) => (
            <Card key={mac.id} className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    {mac.type === '3D_PRINTER' ? (
                      <Printer className="h-5 w-5 text-cyan-500" />
                    ) : (
                      <Cpu className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{mac.name}</h3>
                    <p className="text-xs text-zinc-500 font-mono">{mac.model}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      mac.status === 'RUNNING'
                        ? 'success'
                        : mac.status === 'MAINTENANCE'
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    {mac.status}
                  </Badge>
                  <button
                    onClick={() => handleDelete(mac.id, mac.name)}
                    className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                    title="Delete Machine"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Current Activity Box */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg space-y-1 text-xs">
                <span className="text-zinc-400 text-[10px] uppercase font-bold">Active Job Assignment</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {mac.currentJobTitle || 'Machine currently idle'}
                </p>
              </div>

              {/* Hours & Maintenance Grid */}
              <div className="grid grid-cols-3 gap-2 text-xs text-center border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-bold">Cost Rate</span>
                  <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    Rs. {mac.hourlyRateLKR}/hr
                  </p>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-bold">Last Service</span>
                  <p className="font-mono text-zinc-600 dark:text-zinc-400">{formatDate(mac.lastMaintenanceDate)}</p>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-bold">Next Service</span>
                  <p className="font-mono text-amber-600 dark:text-amber-400">{formatDate(mac.nextMaintenanceDate)}</p>
                </div>
              </div>

              {/* Quick Status Control Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {mac.status !== 'RUNNING' && (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Play className="h-3.5 w-3.5" />}
                    onClick={() => handleStatusChange(mac.id, 'RUNNING')}
                  >
                    Start Job
                  </Button>
                )}
                {mac.status === 'RUNNING' && (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Square className="h-3.5 w-3.5" />}
                    onClick={() => handleStatusChange(mac.id, 'IDLE')}
                  >
                    Stop / Idle
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<Wrench className="h-3.5 w-3.5" />}
                  onClick={() => handleStatusChange(mac.id, 'MAINTENANCE')}
                >
                  Service Log
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <MachineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadMachines}
      />
    </div>
  );
}
