import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

interface UserData {
  subscriptionStatus: string;
  subscriptionExpiry?: string | null;
  scansToday: number;
  lastScanDate: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubDoc: (() => void) | null = null;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        unsubDoc = onSnapshot(doc(db, 'users', user.uid), async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data() as UserData;
            
            // Check expiry
            if (data.subscriptionStatus === 'active' && data.subscriptionExpiry) {
              const expiryDate = new Date(data.subscriptionExpiry);
              if (new Date() > expiryDate) {
                // Subscription expired
                try {
                  const { updateDoc } = await import('firebase/firestore');
                  await updateDoc(doc(db, 'users', user.uid), {
                    subscriptionStatus: 'free',
                    subscriptionExpiry: null
                  });
                  data.subscriptionStatus = 'free';
                  data.subscriptionExpiry = null;
                } catch (updateErr) {
                  console.error("Failed to update expired subscription:", updateErr);
                }
              }
            }
            
            setUserData(data);
          }
        }, (error) => {
          console.error("Firestore snapshot error:", error);
        });
      } else {
        if (unsubDoc) {
          unsubDoc();
          unsubDoc = null;
        }
        setUserData(null);
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
