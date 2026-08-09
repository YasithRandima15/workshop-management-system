'use client';

import React, { useState, useEffect } from 'react';
import { Customer } from '@/types/customer';
import { CustomersService } from '@/lib/services/customers.service';
import { CustomerFormModal } from '@/components/customers/CustomerFormModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { formatLKR, formatDate } from '@/lib/utils/formatters';
import { Plus, Search, UserPlus, Phone, Mail, MapPin, Briefcase, Trash2 } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const loadCustomers = async () => {
    const list = await CustomersService.listCustomers();
    setCustomers(list);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(search.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete customer ${name}?`)) {
      await CustomersService.deleteCustomer(id);
      loadCustomers();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage clients, contact information, order count, and lifetime spending.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          Add Customer
        </Button>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <Input
          placeholder="Search by customer name, code, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Customer Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cust) => (
          <Card key={cust.id} className="p-4 space-y-3 hover:border-brand-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                {cust.customerCode}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400">Added: {formatDate(cust.createdAt)}</span>
                <button
                  onClick={() => handleDelete(cust.id, cust.name)}
                  className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                  title="Delete Customer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{cust.name}</h3>
              {cust.companyName && (
                <p className="text-xs text-zinc-500 font-medium">{cust.companyName}</p>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-zinc-400" /> {cust.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-zinc-400" /> {cust.email}
              </p>
              {cust.address && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" /> {cust.address}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-md text-xs">
              <div>
                <span className="text-zinc-400 text-[10px] uppercase font-bold">Total Orders</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{cust.totalJobsCount} jobs</p>
              </div>
              <div className="text-right">
                <span className="text-zinc-400 text-[10px] uppercase font-bold">Lifetime Spent</span>
                <p className="font-bold font-mono text-brand-600 dark:text-brand-400">
                  {formatLKR(cust.totalSpentLKR)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadCustomers}
      />
    </div>
  );
}
