import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'upwork-ai-users-v1';
const SESSION_KEY = 'upwork-ai-session-v1';

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const hashPassword = async (password) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const normalizeEmail = (email) => email.trim().toLowerCase();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => readJson(USERS_KEY, []));
  const [user, setUser] = useState(() => readJson(SESSION_KEY, null));

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  const register = async ({ name, email, password }) => {
    const cleanName = name.trim();
    const cleanEmail = normalizeEmail(email);

    if (!cleanName || !cleanEmail || password.length < 6) {
      throw new Error('Use a name, email, and password with at least 6 characters.');
    }

    if (users.some((storedUser) => storedUser.email === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const nextUser = {
      id: crypto.randomUUID(),
      name: cleanName,
      email: cleanEmail,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    const nextUsers = [...users, nextUser];
    const sessionUser = { id: nextUser.id, name: nextUser.name, email: nextUser.email };

    setUsers(nextUsers);
    setUser(sessionUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  };

  const login = async ({ email, password }) => {
    const cleanEmail = normalizeEmail(email);
    const passwordHash = await hashPassword(password);
    const matchedUser = users.find((storedUser) => (
      storedUser.email === cleanEmail && storedUser.passwordHash === passwordHash
    ));

    if (!matchedUser) {
      throw new Error('Email or password is incorrect.');
    }

    const sessionUser = { id: matchedUser.id, name: matchedUser.name, email: matchedUser.email };
    setUser(sessionUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const value = {
    hasAccount: users.length > 0,
    isAuthenticated: Boolean(user),
    login,
    logout,
    register,
    user,
  };

  return (
    <AuthContext.Provider value={value}>
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
