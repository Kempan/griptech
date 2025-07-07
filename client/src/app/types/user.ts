// client/src/app/types/user.ts

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  phone?: string | null;
  shippingAddress?: Address | null;
  billingAddress?: Address | null;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Input types for updating users
export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  roles?: string[];
  phone?: string | null;
  shippingAddress?: Address | null;
  billingAddress?: Address | null;
}