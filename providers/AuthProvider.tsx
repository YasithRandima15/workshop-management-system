'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '@/lib/firebase/config';
import { UserProfile, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isFirebaseReady: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_PROFILE: UserProfile = {
  id: 'usr-admin-demo',
  email: 'admin@workshop.lk',
  displayName: 'Master Operator (Demo)',
  role: 'ADMIN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isFirebaseReady = isFirebaseConfigured();

  useEffect(() => {
    if (!isFirebaseReady) {
      // Demo fallback mode when env vars are not set
      setUserProfile(DEMO_USER_PROFILE);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            // Create default user profile in Firestore
            const newProfile: UserProfile = {
              id: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Workshop Operator',
              role: 'OPERATOR',
              photoURL: fbUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          setUserProfile({
            id: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Operator',
            role: 'ADMIN',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isFirebaseReady]);

  const loginWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseReady) {
      setUserProfile(DEMO_USER_PROFILE);
      return;
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signupWithEmail = async (email: string, pass: string, name: string, role: UserRole = 'OPERATOR') => {
    if (!isFirebaseReady) {
      setUserProfile({
        ...DEMO_USER_PROFILE,
        displayName: name,
        email,
        role,
      });
      return;
    }
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const newProfile: UserProfile = {
      id: res.user.uid,
      email,
      displayName: name,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', res.user.uid), newProfile);
    setUserProfile(newProfile);
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseReady) {
      setUserProfile(DEMO_USER_PROFILE);
      return;
    }
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    if (isFirebaseReady) {
      await signOut(auth);
    }
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isFirebaseReady,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
