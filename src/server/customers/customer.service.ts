import { db } from '@/prisma/db';

export type CustomerCreateInput = {
  companyId: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
};

export type CustomerUpdateInput = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
};

export async function createCustomer(customerData: CustomerCreateInput) {
  return db.orm.public.Customer.create(customerData);
}

export async function getCustomersByCompanyId(companyId: number) {
  return db.orm.public.Customer.where({
    companyId,
    isActive: true,
  }).all();
}

export async function getCustomerById(companyId: number, customerId: number) {
  return db.orm.public.Customer.where({
    companyId,
    id: customerId,
    isActive: true,
  }).first();
}

export async function updateCustomer(
  companyId: number,
  customerId: number,
  customerData: CustomerUpdateInput,
) {
  return db.orm.public.Customer.where({
    companyId,
    id: customerId,
    isActive: true,
  }).update(customerData);
}

export async function deleteCustomer(companyId: number, customerId: number) {
  return db.orm.public.Customer.where({
    companyId,
    id: customerId,
  }).update({
    isActive: false,
  });
}
