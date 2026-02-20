'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function SupabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<any[] | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Tenta fazer uma consulta simples para verificar a conexão
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .limit(1);

        if (error) {
          throw error;
        }

        setData(data);
        setConnectionStatus('success');
      } catch (error: any) {
        console.error('Erro na conexão com Supabase:', error);
        setErrorMessage(error.message || 'Erro desconhecido');
        setConnectionStatus('error');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Teste de Conexão Supabase</h2>
      
      {connectionStatus === 'loading' && (
        <div className="text-blue-500">Testando conexão...</div>
      )}
      
      {connectionStatus === 'success' && (
        <div>
          <div className="text-green-500 font-semibold mb-2">
            ✅ Conexão estabelecida com sucesso!
          </div>
          <div className="mt-4">
            <h3 className="font-medium">Dados recebidos:</h3>
            <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      {connectionStatus === 'error' && (
        <div>
          <div className="text-red-500 font-semibold mb-2">
            ❌ Erro na conexão com Supabase
          </div>
          {errorMessage && (
            <div className="bg-red-50 p-3 rounded border border-red-200 text-sm">
              {errorMessage}
            </div>
          )}
          <div className="mt-4 text-sm">
            <p>Verifique:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Se as variáveis de ambiente estão configuradas corretamente</li>
              <li>Se o projeto Supabase está online</li>
              <li>Se a tabela 'users' existe no seu banco de dados</li>
              <li>Se as permissões de acesso estão configuradas corretamente</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}