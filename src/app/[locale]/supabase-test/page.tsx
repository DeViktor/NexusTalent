import SupabaseConnectionTest from '@/components/examples/supabase-connection-test';

export default function SupabaseTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Teste de Conexão com Supabase</h1>
      <SupabaseConnectionTest />
    </div>
  );
}