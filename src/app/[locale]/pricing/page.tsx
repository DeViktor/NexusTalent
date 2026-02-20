'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Star, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Currency = 'brl' | 'eur' | 'aoa';

const recruitmentPlans = {
  monthly: [
    {
      name: 'Starter',
      price: { brl: 'R$ 350', eur: '€ 65', aoa: 'Kz 29.000' },
      description: 'Na medida para empresas que se preparam para começar suas contratações.',
      features: [
        '1 vaga por vez',
        '2 usuários',
        'Publique no nosso mural',
        'ATS (Caesar): gerencie candidatos',
        'Consulte até 50 perfis no Banco de Talentos',
        'Página de Carreiras',
        'Atendimento por e-mail e Chat',
      ],
      popular: false,
    },
    {
      name: 'Grow+IA',
      price: { brl: 'R$ 650', eur: '€ 120', aoa: 'Kz 54.000' },
      description: 'Perfeito para empresas em crescimento e contratações recorrentes.',
      features: [
        '5 vagas simultâneas',
        '4 usuários',
        'Todos os benefícios do plano Starter',
        'Acesso ilimitado ao Banco de Talentos',
        'Uso de IA para descrições de vagas',
        'Integrações com ATS',
        'Atendimento dedicado por WhatsApp e telefone',
      ],
      popular: true,
    },
    {
      name: 'Scale+IA',
      price: { brl: 'R$ 950', eur: '€ 175', aoa: 'Kz 79.000' },
      description: 'Ideal para empresas que criam processos de R&S eficientes para o futuro.',
      features: [
        '10 vagas simultâneas',
        '6 Usuários',
        'Todos os benefícios do plano Grow',
        'Página de carreiras personalizada',
        '50 créditos em serviços de destaque',
        'Desconto no serviço de Hunting',
        'Cursos online gratuitos na Nexus ACADEMY',
      ],
      popular: false,
    },
  ],
  annually: [
    {
      name: 'Starter',
      price: { brl: 'R$ 300', eur: '€ 55', aoa: 'Kz 25.000' },
      description: 'Na medida para empresas que se preparam para começar suas contratações.',
      features: [
        '1 vaga por vez',
        '2 usuários',
        'Publique no nosso mural',
        'ATS (Caesar): gerencie candidatos',
        'Consulte até 50 perfis no Banco de Talentos',
        'Página de Carreiras',
        'Atendimento por e-mail e Chat',
      ],
      popular: false,
    },
    {
      name: 'Grow+IA',
      price: { brl: 'R$ 550', eur: '€ 100', aoa: 'Kz 46.000' },
      description: 'Perfeito para empresas em crescimento e contratações recorrentes.',
      features: [
        '5 vagas simultâneas',
        '4 usuários',
        'Todos os benefícios do plano Starter',
        'Acesso ilimitado ao Banco de Talentos',
        'Uso de IA para descrições de vagas',
        'Integrações com ATS',
        'Atendimento dedicado por WhatsApp e telefone',
      ],
      popular: true,
    },
    {
      name: 'Scale+IA',
      price: { brl: 'R$ 800', eur: '€ 150', aoa: 'Kz 67.000' },
      description: 'Ideal para empresas que criam processos de R&S eficientes para o futuro.',
      features: [
        '10 vagas simultâneas',
        '6 Usuários',
        'Todos os benefícios do plano Grow',
        'Página de carreiras personalizada',
        '50 créditos em serviços de destaque',
        'Desconto no serviço de Hunting',
        'Cursos online gratuitos na Nexus ACADEMY',
      ],
      popular: false,
    },
  ],
};

const trainingPlans = {
  monthly: [
    {
      name: 'Básico',
      price: { brl: 'R$ 99', eur: '€ 18', aoa: 'Kz 8.300' },
      description: 'Acesso essencial para começar a sua jornada de aprendizado.',
      features: [
        'Acesso a 10 cursos selecionados',
        'Certificados de conclusão',
        'Suporte via comunidade',
        'Acesso em 1 dispositivo',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      price: { brl: 'R$ 199', eur: '€ 37', aoa: 'Kz 16.500' },
      description: 'Acesso completo a todo o nosso catálogo para acelerar sua carreira.',
      features: [
        'Acesso ilimitado a todos os cursos',
        'Certificados verificados',
        'Materiais de download e exercícios práticos',
        'Suporte prioritário por e-mail',
        'Acesso em 3 dispositivos',
      ],
      popular: true,
    },
    {
      name: 'Corporativo',
      price: 'Personalizado',
      description: 'Uma solução de formação completa para toda a sua equipa.',
      features: [
        'Todos os benefícios do plano Pro',
        'Painel de gestão de formandos',
        'Relatórios de progresso da equipa',
        'Cursos personalizados',
        'Gestor de conta dedicado',
      ],
      popular: false,
    },
  ],
  annually: [
     {
      name: 'Básico',
      price: { brl: 'R$ 83', eur: '€ 15', aoa: 'Kz 7.000' },
      description: 'Acesso essencial para começar a sua jornada de aprendizado.',
      features: [
        'Acesso a 10 cursos selecionados',
        'Certificados de conclusão',
        'Suporte via comunidade',
        'Acesso em 1 dispositivo',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      price: { brl: 'R$ 166', eur: '€ 30', aoa: 'Kz 13.800' },
      description: 'Acesso completo a todo o nosso catálogo para acelerar sua carreira.',
      features: [
        'Acesso ilimitado a todos os cursos',
        'Certificados verificados',
        'Materiais de download e exercícios práticos',
        'Suporte prioritário por e-mail',
        'Acesso em 3 dispositivos',
      ],
      popular: true,
    },
    {
      name: 'Corporativo',
      price: 'Personalizado',
      description: 'Uma solução de formação completa para toda a sua equipa.',
      features: [
        'Todos os benefícios do plano Pro',
        'Painel de gestão de formandos',
        'Relatórios de progresso da equipa',
        'Cursos personalizados',
        'Gestor de conta dedicado',
      ],
      popular: false,
    },
  ],
};

const PricingCard = ({ plan, currency, billingType }: { plan: any; currency: Currency; billingType: 'monthly' | 'annually' }) => {
    const price = typeof plan.price === 'string' ? plan.price : plan.price[currency];
    const priceSuffix = typeof plan.price !== 'string' ? (billingType === 'monthly' ? '/mês' : '/mês (cobrado anualmente)') : null;
    
    return (
        <Card className={cn("flex flex-col", plan.popular ? "border-primary border-2" : "")}>
            {plan.popular && (
                <div className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider text-center py-1.5 rounded-t-lg flex items-center justify-center gap-1">
                    <Star size={14}/> Mais Popular
                </div>
            )}
          <CardHeader className="flex-grow-0">
            <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{price}</span>
                {priceSuffix && <span className="text-muted-foreground">{priceSuffix}</span>}
            </div>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/90">{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
              {plan.name === 'Corporativo' ? 'Entre em Contato' : 'Subscrever Agora'}
            </Button>
          </CardContent>
        </Card>
    );
};

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [currency, setCurrency] = useState<Currency>('brl');

  const billingType = isAnnual ? 'annually' : 'monthly';

  return (
    <>
      <Header />
      <main className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h1 className="font-headline text-4xl sm:text-5xl font-bold">Planos e Preços</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Escolha o plano ideal para as suas necessidades de recrutamento ou formação. Mude a qualquer momento.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <div className='flex items-center gap-2'>
                    <Globe size={16}/>
                    <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Selecionar Moeda" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="brl">Brasil (BRL)</SelectItem>
                            <SelectItem value="eur">Portugal (EUR)</SelectItem>
                            <SelectItem value="aoa">Angola (AOA)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              <div className="flex items-center justify-center gap-4">
                <Label htmlFor="billing-cycle" className={cn(!isAnnual ? "text-foreground" : "text-muted-foreground")}>Mensal</Label>
                <Switch id="billing-cycle" checked={isAnnual} onCheckedChange={setIsAnnual} />
                <Label htmlFor="billing-cycle" className={cn(isAnnual ? "text-foreground" : "text-muted-foreground")}>
                  Anual <span className="text-green-600 font-bold">(Poupe até 15%)</span>
                </Label>
              </div>
            </div>
          </div>

          <Tabs defaultValue="recruitment" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-12 mb-12">
              <TabsTrigger value="recruitment" className="h-10">Planos de Recrutamento</TabsTrigger>
              <TabsTrigger value="training" className="h-10">Planos de Formação</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recruitment">
                <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                    {recruitmentPlans[billingType].map(plan => (
                        <PricingCard key={plan.name} plan={plan} currency={currency} billingType={billingType} />
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="training">
                 <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                    {trainingPlans[billingType].map(plan => (
                        <PricingCard key={plan.name} plan={plan} currency={currency} billingType={billingType} />
                    ))}
                </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
}
