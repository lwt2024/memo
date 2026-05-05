import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id?: string;
  nickname?: string;
  email?: string;
  avatar?: string;
  createdAt?: string;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { nickname: '用户', email: '' };
  });

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
