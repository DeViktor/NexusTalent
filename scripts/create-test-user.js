const bcrypt = require('bcryptjs');

// Dados do usuário de teste
const testUser = {
  email: 'teste@example.com',
  password: 'teste123',
  name: 'Usuário Teste',
  role: 'student'
};

// Gerar hash da senha
const passwordHash = bcrypt.hashSync(testUser.password, 10);

console.log('=== Dados do Usuário de Teste ===');
console.log('Email:', testUser.email);
console.log('Senha:', testUser.password);
console.log('Nome:', testUser.name);
console.log('Role:', testUser.role);
console.log('Hash da senha:', passwordHash);
console.log('');
console.log('=== SQL para inserir o usuário ===');
console.log(`INSERT INTO public.users (id, email, name, password_hash, role, created_at) VALUES`);
console.log(`(gen_random_uuid(), '${testUser.email}', '${testUser.name}', '${passwordHash}', '${testUser.role}', now());`);
console.log('');
console.log('=== Alternativa com UUID específico ===');
console.log(`INSERT INTO public.users (id, email, name, password_hash, role, created_at) VALUES`);
console.log(`('123e4567-e89b-12d3-a456-426614174000', '${testUser.email}', '${testUser.name}', '${passwordHash}', '${testUser.role}', now());`);