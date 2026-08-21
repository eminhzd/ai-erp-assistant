import { db } from '@/prisma/db';

// type ProductCreateInput = Parameters<typeof db.orm.public.Product.create>[0];

export type ProductCreateInput = {
  companyId: number;
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

export async function createProduct(productData: ProductCreateInput) {
  return db.orm.public.Product.create(productData);
}

export async function getProductsByCompanyId(companyId: number) {
  return db.orm.public.Product.where({ companyId, isActive: true }).all();
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
  return db.orm.public.Product.where({ companyId, id: productId }).update({
    isActive: false,
  });
}
