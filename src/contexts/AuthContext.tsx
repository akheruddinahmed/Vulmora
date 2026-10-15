import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/services/firebase/config';
import { UserProfile } from '@/types/user';
import { useToast } from './ToastContext';

interface AuthContextType {
  currentUser: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (fullName: string, email: string, pass: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { error } = useToast();

  const verifyAdminPrivileges = async (user: User): Promise<boolean> => {
    try {
      // 1. Check custom claims on Firebase ID Token
      const tokenResult = await user.getIdTokenResult(false);
      if (tokenResult.claims.admin === true || tokenResult.claims.role === 'admin') {
        return true;
      }

      // 2. Check /admins/{uid} collection in Firestore for verified server records
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminSnap = await getDoc(adminDocRef);
      if (adminSnap.exists()) {
        const data = adminSnap.data();
        if (data.role === 'admin' || data.role === 'superadmin') {
          return true;
        }
      }

      // 3. Fallback: Check if user email is in the admin email list
      const adminEnvEmails = (import.meta.env.VITE_ADMIN_EMAILS || 'admin@gmail.com,akheruddinahmed@gmail.com,admin@vulmora.in')
        .split(',')
        .map((e: string) => e.trim().toLowerCase());
      
      if (user.email && adminEnvEmails.includes(user.email.toLowerCase())) {
        return true;
      }

      return false;
    } catch (err) {
      console.warn('Error checking admin permissions:', err);
      return false;
    }
  };

  const loadUserProfile = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        setProfile(userSnap.data() as UserProfile);
      } else {
        // Create initial profile record if first login
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          fullName: user.displayName || 'Customer',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);
      }
    } catch (err: any) {
      console.warn('Could not load user profile document:', err.message);
      // Fallback minimal profile
      setProfile({
        uid: user.uid,
        email: user.email || '',
        fullName: user.displayName || 'Customer',
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setCurrentUser(user);
        const adminStatus = await verifyAdminPrivileges(user);
        setIsAdmin(adminStatus);
        await loadUserProfile(user);
      } else {
        setCurrentUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const adminStatus = await verifyAdminPrivileges(cred.user);
      setIsAdmin(adminStatus);
      await loadUserProfile(cred.user);
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err.code) || err.message;
      error('Login Failed', msg);
      throw new Error(msg);
    }
  };

  const register = async (fullName: string, email: string, pass: string, phone?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateFirebaseProfile(cred.user, { displayName: fullName });

      // Create user record in Firestore
      const userProfile: UserProfile = {
        uid: cred.user.uid,
        email,
        fullName,
        phone: phone || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', cred.user.uid), userProfile);
      setProfile(userProfile);
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err.code) || err.message;
      error('Registration Failed', msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const msg = getFriendlyAuthErrorMessage(err.code) || err.message;
      error('Reset Failed', msg);
      throw new Error(msg);
    }
  };

  const refreshAdminStatus = async (): Promise<boolean> => {
    if (!currentUser) return false;
    const adminStatus = await verifyAdminPrivileges(currentUser);
    setIsAdmin(adminStatus);
    return adminStatus;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
        refreshAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function getFriendlyAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-email':
      return 'The email address is improperly formatted.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to too many failed attempts. Try again later.';
    default:
      return 'An authentication error occurred. Please try again.';
  }
}
