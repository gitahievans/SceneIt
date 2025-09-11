"use client";

import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, createContext, useContext, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";

type AuthContextType = {
  user: any;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const supabase = await createClient();
      
      // Check active session
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      // Listen for changes (login, logout, refresh)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    initAuth();
  }, []);

  const signOut = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}


export default function Providers({ children }: { children: ReactNode }) {
  // useState ensures queryclient is only created once per mount
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MantineProvider>
          {children}
        </MantineProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
