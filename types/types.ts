import { Role, User } from "@prisma/client";

export type CategoryProps = {
  title: string;
  slug: string;
  imageUrl: string;
  description: string;
};
export type SavingProps = {
  amount: number;
  month: string;
  name: string;
  userId: string;
  paymentDate: any;
};
export type UserProps = {
  name: string;
  orgName: string;
  firstName: string;
  lastName: string;
  phone: string;
  image: string;
  email: string;
  password: string;
};
export type InvitedUserProps = {
  name: string;
  orgId: string;
  orgName: string;
  locationName: string;
  locationId: string;
  roleId: string;
  firstName: string;
  lastName: string;
  phone: string;
  image: string;
  email: string;
  password: string;
};
export type LoginProps = {
  email: string;
  password: string;
};
export type ForgotPasswordProps = {
  email: string;
};

// types/types.ts

export interface RoleFormData {
  displayName: string;
  description?: string;
  permissions: string[];
  orgId: string;
}

export interface UserWithRoles extends User {
  roles: Role[];
}

export interface RoleOption {
  label: string;
  value: string;
}

export interface UpdateUserRoleResponse {
  error: string | null;
  status: number;
  data: UserWithRoles | null;
}

export interface RoleResponse {
  id: string;
  displayName: string;
  description?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}
export interface UnitDTO {
  id: string;
  name: string;
  symbol: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface TaxDTO {
  id: string;
  name: string;
  rate: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface BriefItemDTO {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  thumbnail: string | null;
}
export interface BrandDTO {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface CategoryDTO {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  parentId: string | null;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SupplierCreateDTO = {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
};
export type CustomerCreateDTO = {
  name: string;
  address?: string;
  email?: string;
  phone?: string;
};
export interface SupplierDTO {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxId: string | null;
  paymentTerms: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface CustomerDTO {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxId: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export type BriefSupplierDTO = {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
};
export type BriefCustomerDTO = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
};
