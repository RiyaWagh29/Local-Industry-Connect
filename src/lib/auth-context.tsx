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
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: { message: string } }>;
  signUp: (userData: Omit<User, "id">, password: string) => Promise<{ success: boolean; error?: { message: string } }>;
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
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId);

    if (error) {
      console.error("Fetch error:", error);
      return null;
    }

    return data?.[0] || null;
  };
  // 🔄 Sync user (🔥 FIXED)
  const syncUser = useCallback(async (sbUser: SupabaseUser | null) => {
    if (!sbUser) {
      setUser(null);
      setRoleState(null);
      setIsLoading(false);
      return;
    }

    let profile = await fetchProfile(sbUser.id);

    // 🚨 AUTO CREATE PROFILE IF NOT EXISTS
    if (!profile) {
      console.log("Creating missing profile...");

      const { error } = await supabase.from("profiles").insert({
        id: sbUser.id,
        email: sbUser.email,
        name: sbUser.user_metadata?.name || "",
        role: sbUser.user_metadata?.role || "student",
        industries: [],
        skills: [],
      });

      if (error) {
        console.error("❌ PROFILE INSERT FAILED:", error);
      } else {
        console.log("✅ PROFILE CREATED SUCCESSFULLY");
      }

      // fetch again
      profile = await fetchProfile(sbUser.id);
    }

    if (profile) {
      const mappedUser: User = {
        id: sbUser.id,
        email: sbUser.email || "",
        name: profile.name || "",
        role: profile.role as Role,
        industries: profile.industries || [],
        skills: profile.skills || [],
        goals: profile.goals,
        company: profile.company,
        experience: profile.experience,
        guidance: profile.guidance,
      };

      setUser(mappedUser);
      setRoleState(mappedUser.role);
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

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setIsLoading(false);
      return { success: false, error: { message: error.message } };
    }

    return { success: true };
  };

  // 🆕 SIGN UP
  const signUp = async (userData: Omit<User, "id">, password: string) => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
        },
      },
    });

    console.log("AUTH RESPONSE:", data, error);

    if (error) {
      setIsLoading(false);
      return { success: false, error: { message: error.message } };
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

  // 🔄 UPDATE USER (🔥 FIXED)
  const updateUser = async (data: Partial<User>) => {
    if (!user?.id) return;

    const dbData: any = {
      id: user.id,
      name: data.name,
      role: data.role,
      bio: data.bio,
      industries: data.industries,
      skills: data.skills,
      goals: data.goals,
      company: data.company,
      experience: data.experience,
      guidance: data.guidance,
    };

    Object.keys(dbData).forEach(key => {
      if (dbData[key] === undefined) delete dbData[key];
    });

    console.log("FINAL UPDATE DATA:", dbData);

    const { error } = await supabase.from("profiles").upsert(dbData);

    if (error) {
      console.error("UPDATE ERROR:", error);
      throw error;
    }

    setUser(prev => (prev ? { ...prev, ...data } : null));
  };

  const isNewUser = !!user && (!user.industries || user.industries.length === 0);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        logout,
        isAuthenticated: !!user,
        isInitialized,
        isNewUser,
        isLoading,
        signIn,
        signUp,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}