import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

import { Role, User } from "./types";

interface AuthContextType {
  user: User | null;
  role: Role;
  setRole: (role: Role) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isNewUser: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: { message: string; status?: number } }>;
  signUp: (userData: Omit<User, "id">, password: string) => Promise<{ success: boolean; error?: { message: string; status?: number } }>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRoleState] = useState<Role>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🔍 Fetch profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // 🔄 Sync user
  const syncUser = useCallback(async (sbUser: SupabaseUser | null) => {
    if (!sbUser) {
      setUser(null);
      setRoleState(null);
      setIsLoading(false);
      return;
    }

    const profile = await fetchProfile(sbUser.id);

    if (profile) {
      const mappedUser: User = {
        id: sbUser.id,
        email: sbUser.email || '',
        name: profile.name || '',
        role: profile.role as Role,
        industries: profile.interests || []
      } as User;

      setUser(mappedUser);
      setRoleState(mappedUser.role);
    } else {
      setUser({
        id: sbUser.id,
        email: sbUser.email || '',
        name: sbUser.user_metadata?.name || '',
        role: sbUser.user_metadata?.role as Role || null,
      } as User);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      syncUser(session?.user ?? null);
      setIsInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      syncUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [syncUser]);

  const setRole = useCallback((newRole: Role) => {
    setRoleState(newRole);
  }, []);

  // 🔐 SIGN IN
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setIsLoading(false);
      return { success: false, error: { message: error.message, status: error.status } };
    }

    return { success: true };
  };

  // 🆕 SIGN UP (FINAL FIXED)
  const signUp = async (userData: Omit<User, "id">, password: string) => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
        }
      }
    });

    if (error) {
      setIsLoading(false);
      return { success: false, error: { message: error.message, status: error.status } };
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          name: userData.name,
          role: userData.role,
          bio: '',
          interests: userData.industries || []
        });

      if (profileError) {
        console.error("PROFILE ERROR:", profileError);
        setIsLoading(false);
        return { success: false, error: { message: profileError.message } };
      }
    }

    return { success: true };
  };

  // 🚪 LOGOUT
  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setRoleState(null);
    setIsLoading(false);
  };

  // 🔄 UPDATE USER (FINAL FIXED)
  const updateUser = async (data: Partial<User>) => {
    if (!user) return;

    const dbData: any = {
      id: user.id,
      name: data.name,
      role: data.role,
      bio: data.bio,
      interests: data.industries || data.interests
    };

    Object.keys(dbData).forEach(key =>
      dbData[key] === undefined && delete dbData[key]
    );

    const { error } = await supabase
      .from('profiles')
      .upsert(dbData);

    if (error) {
      console.error("UPDATE ERROR:", error);
      throw error;
    }

    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const isNewUser = !!user && (!user.industries || user.industries.length === 0);

  return (
    <AuthContext.Provider value={{
      user, role, setRole, logout,
      isAuthenticated: !!user,
      isInitialized,
      isNewUser,
      isLoading,
      signIn,
      signUp,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}