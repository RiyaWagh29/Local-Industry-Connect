import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import api from "./api";
import { Role, User } from "./types";

interface AuthContextType {
  user: User | null;
  role: Role;
  setRole: (role: Role) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: { message: string } }>;
  signUp: (userData: any, password: string) => Promise<{ success: boolean; error?: { message: string } }>;
  updateUser: (data: Partial<User> | FormData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const setRole = useCallback((newRole: Role) => {
    setRoleState(newRole);
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    setRoleState(null);
    window.location.href = "/login";
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setRoleState(null);
      setIsInitialized(true);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get("/users/profile");
      // Pattern: payload = res.data?.data || res.data?.user || []
      const payload = res.data?.data || res.data?.user;
      
      if (payload) {
        const followersCount = typeof payload.followersCount === "number"
          ? payload.followersCount
          : Array.isArray(payload.followers)
            ? payload.followers.length
            : typeof payload.followers === "number"
              ? payload.followers
              : 0;
        const followingCount = typeof payload.followingCount === "number"
          ? payload.followingCount
          : Array.isArray(payload.following)
            ? payload.following.length
            : typeof payload.following === "number"
              ? payload.following
              : 0;
        const mappedUser: User = {
          id: payload._id || payload.id,
          name: payload.name || "",
          email: payload.email || "",
          role: payload.role as Role,
          avatar: payload.avatar,
          industries: payload.industries || [],
          skills: payload.skills || [],
          goals: payload.goals,
          company: payload.company,
          experience: payload.experience,
          guidance: payload.guidance,
          followersCount,
          followingCount,
          onboarding_completed: payload.onboarding_completed ?? false,
          following: payload.following || [],
        };
        setUser(mappedUser);
        setRoleState(mappedUser.role);
        localStorage.setItem("user", JSON.stringify(mappedUser));
      }
    } catch (err) {
      console.warn("Profile refresh failed, maintaining local state.");
      // If profile fails but we have a user in localStorage, keep it
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setRoleState(parsed.role);
      }
    } finally {
      setIsInitialized(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user: loggedUser } = res.data || {};

      if (token && loggedUser) {
        localStorage.setItem("token", token);
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: { message: "Invalid response from server" } };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err?.response?.data?.message || "Login failed" },
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: any, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", { ...userData, password });
      const { token, user: newUser } = res.data || {};

      if (token && newUser) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(newUser)); // 🔥 ADD THIS
  setUser(newUser); // 🔥 ADD THIS
  setRoleState(newUser.role); // 🔥 ADD THIS
  return { success: true };
}
      return { success: false, error: { message: "Signup failed" } };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err?.response?.data?.message || "Signup failed" },
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (data: Partial<User> | FormData) => {
    try {
      const res = data instanceof FormData
        ? await api.put("/users/profile", data, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : await api.put("/users/profile", data);
      const payload = res.data?.data || res.data?.user;
      
      if (payload) {
        const followersCount = typeof payload.followersCount === "number"
          ? payload.followersCount
          : Array.isArray(payload.followers)
            ? payload.followers.length
            : typeof payload.followers === "number"
              ? payload.followers
              : 0;
        const followingCount = typeof payload.followingCount === "number"
          ? payload.followingCount
          : Array.isArray(payload.following)
            ? payload.following.length
            : typeof payload.following === "number"
              ? payload.following
              : 0;
        const mappedUser: User = {
          id: payload._id || payload.id,
          name: payload.name || "",
          email: payload.email || "",
          role: payload.role as Role,
          avatar: payload.avatar,
          industries: payload.industries || [],
          skills: payload.skills || [],
          goals: payload.goals,
          company: payload.company,
          experience: payload.experience,
          guidance: payload.guidance,
          followersCount,
          followingCount,
          onboarding_completed: payload.onboarding_completed ?? false,
          following: payload.following || [],
        };
        setUser(mappedUser);
        setRoleState(mappedUser.role);
        localStorage.setItem("user", JSON.stringify(mappedUser));
      }
    } catch (err) {
      console.error("Update user failed:", err);
      throw err;
    }
  };

  const isNewUser = !!user && user.onboarding_completed === false;

  return (
    <AuthContext.Provider value={{
      user, role, setRole, logout, isAuthenticated: !!user,
      isInitialized, isLoading, isNewUser, signIn, signUp, updateUser, refreshUser
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
