'use client';

import React, { useState, useEffect } from 'react';
import { Machine, MachineStatus } from '@/types/machine';
import { MachinesService } from '@/lib/services/machines.service';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDurationMinutes, formatDate } from '@/lib/utils/formatters';
import { Cpu, Printer, Wrench, Play, Square, CheckCircle2 } from 'lucide-react';

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);

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
      </div>

      {/* Machine Cards Grid */}
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
                <span className="text-zinc-400 text-[10px] uppercase font-bold">Operating Hours</span>
                <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {Math.round(mac.totalOperatingMinutes / 60)} hrs
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
    </div>
  );
}
