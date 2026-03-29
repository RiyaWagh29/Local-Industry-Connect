import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

export type Role = "student" | "mentor" | null;

export interface User {
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatar?: string;
  industries?: string[];
  skills?: string[];
  goals?: string;
  company?: string;
  experience?: number;
  guidance?: string;
  savedOpportunities?: string[]; // IDs of saved opportunities
}

interface AuthContextType {
  user: User | null;
  role: Role;
  setRole: (role: Role) => void;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isNewUser: boolean;
  signIn: (email: string, password: string) => { success: boolean; error?: string };
  signUp: (user: User) => { success: boolean; error?: string };
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "mc_user";
const ACCOUNTS_KEY = "mc_accounts";

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadAccounts(): User[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) return JSON.parse(raw);
    
    // Seed default accounts if none exist
    const defaults: User[] = [
      {
        name: "Test Student",
        email: "student@test.com",
        password: "password123",
        role: "student",
        industries: ["Software", "Design"],
        skills: ["React", "CSS"],
        goals: "Learn full-stack development",
        savedOpportunities: []
      },
      {
        name: "Rahul Deshmukh",
        email: "mentor@test.com",
        password: "password123",
        role: "mentor",
        company: "TCS Nashik",
        experience: 12,
        guidance: "Career guidance and technical mentorship",
        industries: ["Software"],
        skills: ["System Design", "React"],
        savedOpportunities: []
      }
    ];
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(defaults));
    return defaults;
  } catch {
    return [];
  }
}

function saveAccounts(accounts: User[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<Role>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedUser = loadUser();
    if (storedUser) {
      setUser(storedUser);
      setRoleState(storedUser.role);
    }
    setIsInitialized(true);
  }, []);

  const setRole = useCallback((newRole: Role) => {
    setRoleState(newRole);
  }, []);

  const login = useCallback((userData: User) => {
    setUser(userData);
    setRoleState(userData.role);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setRoleState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      // Also update in accounts list
      const accounts = loadAccounts();
      const updatedAccounts = accounts.map(a => a.email === updated.email ? updated : a);
      saveAccounts(updatedAccounts);
      
      return updated;
    });
  }, []);

  const signUp = useCallback((userData: User): { success: boolean; error?: string } => {
    const accounts = loadAccounts();
    const exists = accounts.find((a) => a.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) return { success: false, error: "auth.emailExists" };
    
    // Ensure new users have empty profile fields to trigger onboarding
    const newUser = { 
      ...userData, 
      industries: userData.industries || [], 
      skills: userData.skills || [],
      savedOpportunities: []
    };
    
    accounts.push(newUser);
    saveAccounts(accounts);
    login(newUser);
    return { success: true };
  }, [login]);

  const signIn = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    const accounts = loadAccounts();
    const found = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!found) return { success: false, error: "auth.invalidCredentials" };
    login(found);
    return { success: true };
  }, [login]);

  const isNewUser = !!user && (!user.industries || user.industries.length === 0);

  return (
    <AuthContext.Provider value={{ 
      user, role, setRole, login, logout, 
      isAuthenticated: !!user, isInitialized, isNewUser,
      signIn, signUp, updateUser 
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
