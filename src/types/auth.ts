export type User = {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  profile_photo_url?: string;
  terms_agreed: boolean;
  is_kyc_verified: boolean;
  created_at: string;
};

export type SignUpData = {
  full_name: string;
  email: string;
  password: string;
  terms_agreed: boolean;
  phone_number?: string;
};

export type SignInData = {
  email: string;
  password: string;
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signIn: (data: SignInData) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithFacebook: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
};

export type PasswordValidation = {
  isValid: boolean;
  requirements: string[];
};