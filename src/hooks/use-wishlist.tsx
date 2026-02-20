'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useToast } from './use-toast';

const WISHLIST_STORAGE_KEY = 'nexus-wishlist';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (courseId: string) => void;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (error) {
      console.error("Failed to load wishlist from localStorage:", error);
    }
    setIsLoading(false);
  }, []);

  const saveWishlist = useCallback((updatedWishlist: string[]) => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updatedWishlist));
      setWishlist(updatedWishlist);
    } catch (error) {
      console.error("Failed to save wishlist to localStorage:", error);
    }
  }, []);

  const toggleWishlist = useCallback((courseId: string) => {
    const isInWishlist = wishlist.includes(courseId);
    const updatedWishlist = isInWishlist
      ? wishlist.filter(id => id !== courseId)
      : [...wishlist, courseId];
    
    saveWishlist(updatedWishlist);

    toast({
      title: isInWishlist ? "Curso removido!" : "Curso adicionado!",
      description: `O curso foi ${isInWishlist ? 'removido da' : 'adicionado à'} sua lista de interesses.`,
    });
  }, [wishlist, saveWishlist, toast]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
