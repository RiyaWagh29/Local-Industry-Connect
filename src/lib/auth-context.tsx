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
  const [user, setUser] = useState<(User & { onboarding_completed?: boolean }) | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRoleState] = useState<Role>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🔍 Fetch profile (FIXED)
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Fetch error:", error);
      return null;
    }

    return data || null;
  };

  // 🔄 Sync user (STRONG FIX)
  const syncUser = useCallback(async (sbUser: SupabaseUser | null) => {
    if (!sbUser) {
      setUser(null);
      setRoleState(null);
      setIsLoading(false);
      return;
    }

    let profile = await fetchProfile(sbUser.id);

    // 🔥 FORCE CREATE PROFILE (RETRY SAFE)
    if (!profile) {
      console.log("Creating profile...");

      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: sbUser.id,
          email: sbUser.email,
          name: sbUser.user_metadata?.name || "",
          role: sbUser.user_metadata?.role || "student",
          industries: [],
          skills: [],
          onboarding_completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error("Profile creation failed:", error);
      } else {
        console.log("Profile created:", data);
        profile = data;
      }
    }

    if (profile) {
      const mappedUser = {
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
        onboarding_completed: profile.onboarding_completed || false,
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

    const { error } = await supabase.auth.signUp({
      email: userData.email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
        },
      },
    });

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

  // 🔥 UPDATE USER (FINAL FIX)
  const updateUser = async (data: Partial<User>) => {
    console.log("🚀 updateUser CALLED");
    if (!user?.id) return;

    const dbData: any = {
      id: user.id,
      industries: data.industries || [],
      skills: data.skills || [],
      company: data.company,
      experience: data.experience,
      guidance: data.guidance,
      goals: data.goals,
      onboarding_completed: true,
    };

    Object.keys(dbData).forEach(key => {
      if (dbData[key] === undefined) delete dbData[key];
    });

    console.log("SAVING PROFILE:", dbData);

    const { data: updated, error } = await supabase
      .from("profiles")
      .upsert(dbData)
      .select()
      .single();

    if (error) {
      console.error("UPDATE ERROR:", error);
      throw error;
    }

    // 🔥 update full state from DB response
    setUser(prev =>
      prev
        ? {
          ...prev,
          ...updated,
        }
        : null
    );
  };

  // 🔥 FINAL LOGIC
  const isNewUser =
    !!user &&
    user.role === "mentor" &&
    !user.onboarding_completed;

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