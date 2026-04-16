import { useState, useCallback } from "react";

export interface AuthUser {
  name: string;
  email: string;
  createdAt: string;
}

interface StoredUser extends AuthUser {
  passwordHash: string;
}

const USERS_KEY   = "luffy-users";
const SESSION_KEY = "luffy-session";

function hashPassword(pw: string): string {
  return btoa(encodeURIComponent(pw + "luffy-salt-2024"));
}

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getSession);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 600));

    const users = getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!found || found.passwordHash !== hashPassword(password)) {
      setError("Invalid email or password.");
      setLoading(false);
      return false;
    }

    const { passwordHash: _, ...session } = found;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    setLoading(false);
    return true;
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      setError("");
      await new Promise((r) => setTimeout(r, 600));

      const users = getUsers();
      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        setError("An account with this email already exists.");
        setLoading(false);
        return false;
      }

      const newUser: StoredUser = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      };
      saveUsers([...users, newUser]);

      const { passwordHash: _, ...session } = newUser;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      setLoading(false);
      return true;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return { user, error, loading, login, signup, logout, setError };
}
