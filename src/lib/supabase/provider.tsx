"use client";

import React from 'react';
import { supabase } from './client';

type Props = {
  children: React.ReactNode;
};

// Provider simples para garantir inicialização do cliente do Supabase e
// permitir futura injeção de contexto sem quebrar a árvore de componentes.
export function SupabaseProvider({ children }: Props) {
  // Poderíamos expor um contexto aqui se necessário futuramente.
  // No momento, apenas garantimos que o módulo do cliente é carregado.
  void supabase;
  return <>{children}</>;
}