'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Customer, JobPart, JobPriority, DeliveryMethod } from '@/types';
import { CustomersService } from '@/lib/services/customers.service';
import { JobsService } from '@/lib/services/jobs.service';
import { PricingService } from '@/lib/services/pricing.service';
import { PartBuilderCard } from './PartBuilderCard';
import { CustomerFormModal } from '@/components/customers/CustomerFormModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { formatLKR } from '@/lib/utils/formatters';
import {
  UserPlus,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Briefcase,
  Search,
} from 'lucide-react';

export function NewJobWizard() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [title, setTitle] = useState<string>('');
  const [priority, setPriority] = useState<JobPriority>('NORMAL');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [discountLKR, setDiscountLKR] = useState<number>(0);
  const [deliveryFeeLKR, setDeliveryFeeLKR] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Parts List
  const [parts, setParts] = useState<JobPart[]>([
    {
      id: `part-${Date.now()}`,
      partName: 'Main Part Prototype #01',
      quantity: 1,
      manufacturingMethod: '3D_PRINTING',
      unitPriceLKR: 2500,
      totalPriceLKR: 2500,
      printDetails: {
        materialName: 'PLA Tough',
        color: 'Black',
        filamentWeightGrams: 120,
        estimatedPrintMinutes: 150,
      },
    },
  ]);

  useEffect(() => {
    CustomersService.listCustomers().then(setCustomers);
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const addPart = () => {
    const newPart: JobPart = {
      id: `part-${Date.now()}`,
      partName: `Part #${parts.length + 1}`,
      quantity: 1,
      manufacturingMethod: '3D_PRINTING',
      unitPriceLKR: 2000,
      totalPriceLKR: 2000,
      printDetails: {
        materialName: 'PLA Tough',
        color: 'Black',
        filamentWeightGrams: 100,
        estimatedPrintMinutes: 120,
      },
    };
    setParts([...parts, newPart]);
  };

  const updatePart = (index: number, updated: JobPart) => {
    const nextParts = [...parts];
    nextParts[index] = updated;
    setParts(nextParts);
  };

  const duplicatePart = (index: number) => {
    const target = parts[index];
    const duplicated: JobPart = {
      ...target,
      id: `part-${Date.now()}`,
      partName: `${target.partName} (Copy)`,
    };
    setParts([...parts, duplicated]);
  };

  const deletePart = (index: number) => {
    if (parts.length <= 1) return;
    setParts(parts.filter((_, i) => i !== index));
  };

  // Centralized Pricing Service output
  const pricing = PricingService.calculateJobPricing({
    parts,
    discountLKR,
    deliveryFeeLKR,
  });

  const manufacturingTypes = Array.from(
    new Set(parts.map((p) => p.manufacturingMethod))
  );

  const handleCreateJob = async () => {
    if (!selectedCustomer) return;
    setIsSubmitting(true);
    try {
      const created = await JobsService.createJob({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerEmail: selectedCustomer.email,
        title: title || `${selectedCustomer.name} - Custom Job`,
        priority,
        status: 'QUOTATION',
        manufacturingTypes,
        parts,
        subtotalLKR: pricing.partsSubtotalLKR,
        discountLKR: pricing.discountLKR,
        taxLKR: pricing.taxLKR,
        deliveryFeeLKR: pricing.deliveryFeeLKR,
        totalLKR: pricing.totalLKR,
        dueDate,
        deliveryMethod,
        deliveryAddress: deliveryAddress || selectedCustomer.address,
        notes,
      });

      router.push(`/jobs/${created.id}`);
    } catch (err) {
      console.error('Failed to create job', err);
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Customer' },
    { num: 2, label: 'Parts Builder' },
    { num: 3, label: 'Production' },
    { num: 4, label: 'Pricing & Delivery' },
    { num: 5, label: 'Review & Submit' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Multi-step Stepper Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step === s.num
                      ? 'bg-brand-500 text-white shadow-xs'
                      : step > s.num
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                </div>
                <span
                  className={`text-xs font-medium hidden md:inline ${
                    step === s.num
                      ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 hidden sm:block ${
                    step > s.num ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* STEP 1: CUSTOMER SELECTION */}
      {step === 1 && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Step 1: Select Customer
              </h2>
              <p className="text-xs text-zinc-500">
                Search existing customer accounts or add a new customer instantly.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<UserPlus className="h-4 w-4" />}
              onClick={() => setIsNewCustomerModalOpen(true)}
            >
              Create Customer
            </Button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by customer name, phone, or company..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Customer Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {filteredCustomers.map((cust) => {
              const isSelected = selectedCustomer?.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-3.5 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 ring-1 ring-brand-500'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                      {cust.customerCode}
                    </span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-brand-500" />}
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                    {cust.name}
                  </h4>
                  {cust.companyName && (
                    <p className="text-xs text-zinc-500 truncate">{cust.companyName}</p>
                  )}
                  <p className="text-[11px] text-zinc-400 mt-2">{cust.phone} • {cust.email}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              disabled={!selectedCustomer}
              onClick={() => setStep(2)}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Continue to Parts Builder
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: PARTS BUILDER */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Step 2: Build Job Parts
              </h2>
              <p className="text-xs text-zinc-500">
                Add 3D Printing or CNC machining items with parameters and pricing.
              </p>
            </div>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={addPart}>
              Add Part
            </Button>
          </div>

          <div className="space-y-4">
            {parts.map((part, index) => (
              <PartBuilderCard
                key={part.id}
                part={part}
                onUpdate={(updated) => updatePart(index, updated)}
                onDuplicate={() => duplicatePart(index)}
                onDelete={() => deletePart(index)}
              />
            ))}
          </div>

          <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg">
            <Button variant="outline" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Subtotal ({parts.length} parts):</p>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {formatLKR(pricing.partsSubtotalLKR)}
              </p>
            </div>
            <Button onClick={() => setStep(3)} rightIcon={<ArrowRight className="h-4 w-4" />}>
              Production Details
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: PRODUCTION DETAILS */}
      {step === 3 && (
        <Card className="p-6 space-y-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            Step 3: Production & Priority Details
          </h2>

          <Input
            label="Job Title / Description *"
            placeholder="e.g. Drone Enclosure V3 & CNC Mounting Flange"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Priority Level"
              value={priority}
              onChange={(e) => setPriority(e.target.value as JobPriority)}
              options={[
                { value: 'LOW', label: 'Low Priority' },
                { value: 'NORMAL', label: 'Normal Priority' },
                { value: 'HIGH', label: 'High Priority' },
                { value: 'URGENT', label: 'URGENT Express' },
              ]}
            />
            <Input
              label="Target Due Date *"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Internal Workshop Notes
            </label>
            <textarea
              rows={3}
              placeholder="Add special instructions, post-processing notes, or tolerance specs..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="outline" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
            <Button onClick={() => setStep(4)} rightIcon={<ArrowRight className="h-4 w-4" />}>
              Pricing & Delivery
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: PRICING & DELIVERY */}
      {step === 4 && (
        <Card className="p-6 space-y-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            Step 4: Pricing Adjustments & Delivery Method
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Discount Amount (LKR)"
              type="number"
              value={discountLKR}
              onChange={(e) => setDiscountLKR(parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Delivery Fee (LKR)"
              type="number"
              value={deliveryFeeLKR}
              onChange={(e) => setDeliveryFeeLKR(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Delivery Method"
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
              options={[
                { value: 'PICKUP', label: 'Workshop Pickup' },
                { value: 'COURIER', label: 'Courier Service (Pronto/Domex)' },
                { value: 'DELIVERY', label: 'Direct Workshop Delivery' },
              ]}
            />
            <Input
              label="Delivery Address"
              value={deliveryAddress}
              placeholder={selectedCustomer?.address || 'Enter delivery address'}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </div>

          {/* Pricing Breakdown Box */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-lg space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Parts Subtotal:</span>
              <span className="font-mono">{formatLKR(pricing.partsSubtotalLKR)}</span>
            </div>
            {discountLKR > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount Applied:</span>
                <span className="font-mono">- {formatLKR(pricing.discountLKR)}</span>
              </div>
            )}
            {deliveryFeeLKR > 0 && (
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Delivery Charge:</span>
                <span className="font-mono">+ {formatLKR(pricing.deliveryFeeLKR)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-200 dark:border-zinc-700">
              <span>Final Total Quote:</span>
              <span className="font-mono text-brand-600 dark:text-brand-400">{formatLKR(pricing.totalLKR)}</span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="outline" onClick={() => setStep(3)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
            <Button onClick={() => setStep(5)} rightIcon={<ArrowRight className="h-4 w-4" />}>
              Review Job
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 5: REVIEW & SUBMIT */}
      {step === 5 && (
        <Card className="p-6 space-y-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-brand-500" /> Review & Confirm Job
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-md">
              <span className="text-zinc-400 uppercase text-[10px] font-bold">Customer</span>
              <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">
                {selectedCustomer?.name}
              </p>
              <p className="text-zinc-500">{selectedCustomer?.phone} • {selectedCustomer?.email}</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-md">
              <span className="text-zinc-400 uppercase text-[10px] font-bold">Priority & Due Date</span>
              <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">
                {priority} Priority
              </p>
              <p className="text-zinc-500">Target Delivery: {dueDate}</p>
            </div>
          </div>

          {/* Parts list summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Parts ({parts.length})</h4>
            <div className="space-y-2">
              {parts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-md flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{p.partName}</span>
                    <span className="ml-2 text-zinc-400">
                      [{p.manufacturingMethod === '3D_PRINTING' ? '3D Print' : 'CNC'}] × {p.quantity}
                    </span>
                  </div>
                  <span className="font-bold font-mono">{formatLKR(p.totalPriceLKR)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grand total highlight */}
          <div className="p-4 bg-brand-500/10 border border-brand-500/30 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">Grand Total Amount</p>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                {formatLKR(pricing.totalLKR)}
              </h3>
            </div>
            <Button
              onClick={handleCreateJob}
              isLoading={isSubmitting}
              size="lg"
              leftIcon={<CheckCircle2 className="h-5 w-5" />}
            >
              Create Job Order
            </Button>
          </div>

          <div className="flex justify-start">
            <Button variant="outline" onClick={() => setStep(4)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
          </div>
        </Card>
      )}

      {/* Modal for Creating Customer inline */}
      <CustomerFormModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        onSuccess={(created) => {
          setCustomers((prev) => [created, ...prev]);
          setSelectedCustomer(created);
        }}
      />
    </div>
  );
}
