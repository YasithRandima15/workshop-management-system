'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, CustomerFormValues } from '@/lib/validations/customer.schema';
import { CustomersService } from '@/lib/services/customers.service';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Customer } from '@/types';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCustomer: Customer) => void;
}

export function CustomerFormModal({ isOpen, onClose, onSuccess }: CustomerFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      const created = await CustomersService.createCustomer(data);
      reset();
      onSuccess(created);
      onClose();
    } catch (err) {
      console.error('Failed to create customer', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Customer"
      description="Add a new customer profile without leaving your current job creation workflow."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Customer Full Name *"
          placeholder="e.g. Kasun Jayawardena"
          {...register('name')}
          error={errors.name?.message}
        />
        <Input
          label="Company Name (Optional)"
          placeholder="e.g. Apex Robotics LK"
          {...register('companyName')}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address *"
            type="email"
            placeholder="kasun@apexrobotics.lk"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Phone Number *"
            placeholder="+94 77 123 4567"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>
        <Input
          label="Address (Optional)"
          placeholder="e.g. Malabe, Sri Lanka"
          {...register('address')}
        />
        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Customer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
