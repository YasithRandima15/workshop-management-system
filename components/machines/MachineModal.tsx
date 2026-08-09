'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { MachinesService } from '@/lib/services/machines.service';
import { MachineType, MachineStatus } from '@/types/machine';
import { Cpu, AlertCircle } from 'lucide-react';

interface MachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MachineModal({ isOpen, onClose, onSuccess }: MachineModalProps) {
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState<MachineType>('3D_PRINTER');
  const [status, setStatus] = useState<MachineStatus>('IDLE');
  const [hourlyRateLKR, setHourlyRateLKR] = useState<number>(1500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a machine name');
      return;
    }

    setIsSubmitting(true);
    try {
      await MachinesService.createMachine({
        name,
        model: model || 'Standard',
        type,
        status,
        hourlyRateLKR,
        totalOperatingMinutes: 0,
      });

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create machine');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Workshop Machine"
      description="Register a new 3D Printer, SLA machine, or CNC Milling Router."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 rounded-md text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Machine Name *"
          placeholder="e.g. Bambu Lab X1-Carbon #2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Machine Type *"
            value={type}
            onChange={(e) => setType(e.target.value as MachineType)}
            options={[
              { value: '3D_PRINTER', label: '3D Printer (FDM / SLA)' },
              { value: 'CNC', label: 'CNC Mill / Router' },
            ]}
          />
          <Input
            label="Model / Manufacturer"
            placeholder="e.g. Haas VF-2SS"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Initial Status *"
            value={status}
            onChange={(e) => setStatus(e.target.value as MachineStatus)}
            options={[
              { value: 'IDLE', label: 'IDLE (Available)' },
              { value: 'RUNNING', label: 'RUNNING (Active Job)' },
              { value: 'MAINTENANCE', label: 'MAINTENANCE (Servicing)' },
              { value: 'OFFLINE', label: 'OFFLINE (Down)' },
            ]}
          />
          <Input
            label="Machine Cost Rate (LKR / Hr) *"
            type="number"
            value={hourlyRateLKR}
            onChange={(e) => setHourlyRateLKR(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} leftIcon={<Cpu className="h-4 w-4" />}>
            Add Machine
          </Button>
        </div>
      </form>
    </Modal>
  );
}
