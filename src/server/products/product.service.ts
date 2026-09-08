import { db } from '@/prisma/db';

export type ProductCreateInput = {
  name: string;
  description?: string;
  sku: string;
  unit?: string;
  salePrice: string;
  purchasePrice: string;
};

export type ProductUpdateInput = {
  name?: string;
  description?: string;
  sku?: string;
  unit?: string;
  salePrice?: string;
  purchasePrice?: string;
};

export async function createProduct(
  companyId: number,
  productData: ProductCreateInput,
) {
  return db.orm.public.Product.create({
    ...productData,
    companyId,
  });
}

export async function getProductsByCompanyId(companyId: number) {
  return db.orm.public.Product.where({
    companyId,
    isActive: true,
  }).all();
}

export async function getProductById(companyId: number, productId: number) {
  return db.orm.public.Product.where({
    companyId,
    id: productId,
    isActive: true,
  }).first();
}

export async function updateProduct(
  companyId: number,
  productId: number,
  productData: ProductUpdateInput,
) {
  return db.orm.public.Product.where({
    companyId,
    id: productId,
    isActive: true,
  }).update(productData);
}

export async function deleteProduct(companyId: number, productId: number) {
  return db.orm.public.Product.where({
    companyId,
    id: productId,
  }).update({
    isActive: false,
  });
}
