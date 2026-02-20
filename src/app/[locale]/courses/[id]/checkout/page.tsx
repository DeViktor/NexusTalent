'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { getCourseById } from '@/lib/course-service';
import type { Course } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Tag, Lock, QrCode } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getImages } from '@/lib/site-data';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [voucher, setVoucher] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [expressPhoneNumber, setExpressPhoneNumber] = useState('');


  useEffect(() => {
    if (id) {
      const foundCourse = getCourseById(id);
      setCourse(foundCourse || null);
       if (foundCourse) {
        const paymentData = `Pagamento para NexusTalent;Curso: ${foundCourse.name};Valor: 25.000 AOA`;
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(paymentData)}`;
        setQrCodeUrl(qrApiUrl);
      }
    }
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!course) {
    return notFound();
  }

  const image = getImages().find(p => p.id === course.imageId);
  const imageSrc = course.imageDataUri || image?.imageUrl;
  
  const handlePayment = (method: string) => {
    setIsProcessing(true);
    toast({
        title: "A processar pagamento...",
        description: `Aguarde enquanto simulamos o pagamento via ${method}.`,
    });
    // Simulate payment processing
    setTimeout(() => {
        toast({
            title: "Matrícula Efetuada!",
            description: `A sua inscrição no curso "${course.name}" foi concluída.`,
        });
        router.push('/dashboard/student');
    }, 2500);
  }

  return (
    <>
      <Header />
      <main className="py-12 bg-secondary">
        <div className="container mx-auto max-w-4xl">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Finalizar Matrícula</CardTitle>
              <CardDescription>Confirme os detalhes e prossiga para o pagamento.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Resumo do Pedido</h3>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                    {imageSrc && (
                        <div className="relative w-24 h-16 rounded-md overflow-hidden">
                             <Image src={imageSrc} alt={course.name} fill className="object-cover" />
                        </div>
                    )}
                    <div>
                        <h4 className="font-semibold">{course.name}</h4>
                        <p className="text-sm text-muted-foreground">{course.format}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="voucher">Código Promocional</Label>
                    <div className="flex gap-2">
                        <Input id="voucher" placeholder="VOUCHER2024" value={voucher} onChange={e => setVoucher(e.target.value)} />
                        <Button variant="outline"><Tag className="mr-2 h-4 w-4" /> Aplicar</Button>
                    </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Subtotal:</span> <span className="font-medium">AOA 25.000</span></div>
                    <div className="flex justify-between text-green-600"><span>Desconto:</span> <span className="font-medium">- AOA 0</span></div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span>Total:</span> <span>AOA 25.000</span></div>
                </div>
              </div>
              <div className="space-y-6 bg-secondary/50 p-6 rounded-lg">
                 <h3 className="font-semibold text-lg">Procedimentos de Pagamento</h3>
                  <Tabs defaultValue="reference" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="reference">Referência</TabsTrigger>
                      <TabsTrigger value="express">Expresso</TabsTrigger>
                       <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                    </TabsList>
                    <TabsContent value="reference" className="mt-4 text-sm space-y-3">
                      <p className="text-xs text-muted-foreground">Efetue o pagamento numa caixa Multicaixa ou no seu Internet Banking usando os dados abaixo.</p>
                      <div className="font-mono p-4 border rounded-md bg-background">
                        <p><strong>Entidade:</strong> 12345</p>
                        <p><strong>Referência:</strong> {`123 456 ${new Date().getTime().toString().slice(-3)}`}</p>
                        <p><strong>Montante:</strong> AOA 25.000,00</p>
                      </div>
                       <Button className="w-full mt-4" size="lg" onClick={() => handlePayment('Referência')} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                            Confirmar Inscrição
                        </Button>
                    </TabsContent>
                    <TabsContent value="express" className="mt-4 text-sm space-y-3">
                        <p className="text-xs text-muted-foreground">Insira o seu número de telefone associado ao Multicaixa Express. Receberá uma notificação para confirmar o pagamento.</p>
                        <div className="space-y-2">
                            <Label htmlFor="express-phone">Nº de Telemóvel</Label>
                            <Input id="express-phone" type="tel" placeholder="9XX XXX XXX" value={expressPhoneNumber} onChange={e => setExpressPhoneNumber(e.target.value)} />
                        </div>
                         <Button className="w-full mt-4" size="lg" onClick={() => handlePayment('Expresso')} disabled={isProcessing || !expressPhoneNumber}>
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                            Pagar com Expresso
                        </Button>
                    </TabsContent>
                     <TabsContent value="qrcode" className="mt-4 text-sm space-y-3">
                        <p className="text-xs text-muted-foreground">Use a sua aplicação de pagamentos para ler o código QR e efetuar o pagamento.</p>
                         <div className="p-4 border rounded-md bg-background flex flex-col items-center justify-center">
                            {qrCodeUrl ? (
                                <Image src={qrCodeUrl} alt="QR Code para pagamento" width={180} height={180} />
                            ) : (
                                <div className="h-[180px] w-[180px] flex items-center justify-center bg-muted">
                                    <Loader2 className="h-8 w-8 animate-spin"/>
                                </div>
                            )}
                            <p className='mt-4 font-mono font-bold'>AOA 25.000,00</p>
                        </div>
                          <Button className="w-full mt-4" size="lg" onClick={() => handlePayment('QR Code')} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                            Confirmar Inscrição
                        </Button>
                    </TabsContent>
                  </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
