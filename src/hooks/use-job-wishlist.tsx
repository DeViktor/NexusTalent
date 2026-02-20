'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useToast } from './use-toast';

const JOB_WISHLIST_STORAGE_KEY = 'nexus-job-wishlist';

interface JobWishlistContextType {
  wishlist: string[];
  toggleWishlist: (jobId: string) => void;
  isLoading: boolean;
}

const JobWishlistContext = createContext<JobWishlistContextType | undefined>(undefined);

export const JobWishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem(JOB_WISHLIST_STORAGE_KEY);
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (error) {
      console.error("Failed to load job wishlist from localStorage:", error);
    }
    setIsLoading(false);
  }, []);

  const saveWishlist = useCallback((updatedWishlist: string[]) => {
    try {
      localStorage.setItem(JOB_WISHLIST_STORAGE_KEY, JSON.stringify(updatedWishlist));
      setWishlist(updatedWishlist);
    } catch (error) {
      console.error("Failed to save job wishlist to localStorage:", error);
    }
  }, []);

  const toggleWishlist = useCallback((jobId: string) => {
    const isInWishlist = wishlist.includes(jobId);
    const updatedWishlist = isInWishlist
      ? wishlist.filter(id => id !== jobId)
      : [...wishlist, jobId];
    
    saveWishlist(updatedWishlist);

    toast({
      title: isInWishlist ? "Emprego removido!" : "Emprego adicionado!",
      description: `O emprego foi ${isInWishlist ? 'removido da' : 'adicionado à'} sua lista de interesses.`,
    });
  }, [wishlist, saveWishlist, toast]);

  return (
    <JobWishlistContext.Provider value={{ wishlist, toggleWishlist, isLoading }}>
      {children}
    </JobWishlistContext.Provider>
  );
};

export const useJobWishlist = (): JobWishlistContextType => {
  const context = useContext(JobWishlistContext);
  if (context === undefined) {
    throw new Error('useJobWishlist must be used within a JobWishlistProvider');
  }
  return context;
};
