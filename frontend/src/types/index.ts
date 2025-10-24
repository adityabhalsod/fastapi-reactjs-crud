import { ReactNode } from 'react';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SignupData {
  email: string;
  username: string;
  full_name: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  reset_token: string;
  expires_in: number;
}

export interface ResetPasswordData {
  reset_token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ItemOwner {
  id: number;
  username: string;
  full_name: string | null;
}

export interface Item {
  id: number;
  name: string;
  description?: string;
  category?: string;
  price: number;
  quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner_id: number;
  owner?: ItemOwner;
}

export interface ItemCreate {
  name: string;
  description?: string;
  category?: string;
  price?: number;
  quantity?: number;
  is_active?: boolean;
}

export interface ItemUpdate {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  quantity?: number;
  is_active?: boolean;
}

export interface ItemsResponse {
  items: Item[];
  total: number;
  skip: number;
  limit: number;
}

export interface SearchParams {
  skip: number;
  limit: number;
  search?: string;
  category?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CategoryStats {
  name: string;
  count: number;
}

export interface ItemStatsResponse {
  total_items: number;
  total_value: number;
  categories: CategoryStats[];
  recent_items: number;
}

export interface ApiError {
  detail: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: { [key: string]: string };
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

export interface PaginationParams {
  skip: number;
  limit: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
  category?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
}

// Context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
}

// Component prop types
export interface ProtectedRouteProps {
  children: ReactNode;
}

export interface LoadingButtonProps {
  loading: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

export interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}