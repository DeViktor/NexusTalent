'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, Send, X, Loader2, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChatbotResponseAction } from '@/app/actions';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback } from '../ui/avatar';
import Link from 'next/link';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  links?: { title: string; url: string }[];
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Olá! Sou o assistente da NexusTalent. Como posso ajudar a encontrar o seu próximo curso ou vaga de emprego?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const chatContentRef = useRef<HTMLDivElement>(null);

  const isDashboard = pathname.includes('/dashboard');

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await getChatbotResponseAction({
        query: inputValue,
        context: `The user is currently on the ${pathname} page.`,
      });
      
      const botMessage: Message = {
        sender: 'bot',
        text: result.response,
        links: result.suggestedLinks,
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      const errorMessage: Message = {
        sender: 'bot',
        text: "Desculpe, ocorreu um erro ao comunicar com a IA. Por favor, tente novamente."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isDashboard) {
      return null;
  }

  return (
    <>
      <div className={cn("fixed bottom-4 right-4 z-50 transition-all duration-300", isOpen ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100")}>
        <Button size="lg" className="rounded-full h-16 w-16 shadow-lg" onClick={() => setIsOpen(true)}>
          <Bot size={32} className="text-primary-foreground" />
        </Button>
      </div>

      <div className={cn("fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm transition-all duration-300", isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none")}>
        <Card className="h-[70vh] flex flex-col shadow-2xl">
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">Nexus Assistant</CardTitle>
                <CardDescription>Estou aqui para ajudar</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X />
            </Button>
          </CardHeader>
          <CardContent ref={chatContentRef} className="flex-grow overflow-y-auto space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={cn("flex gap-2", message.sender === 'user' ? 'justify-end' : 'justify-start')}>
                {message.sender === 'bot' && <Avatar className="w-8 h-8"><AvatarFallback className="bg-secondary"><Bot size={16} /></AvatarFallback></Avatar>}
                <div className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                )}>
                  <p>{message.text}</p>
                  {message.links && message.links.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-secondary-foreground/20 pt-2">
                      {message.links.map((link, i) => (
                        <Link key={i} href={link.url} target="_blank" className="flex items-center gap-2 text-xs hover:underline">
                          <LinkIcon size={12}/> {link.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
             {isLoading && (
              <div className="flex gap-2 justify-start">
                <Avatar className="w-8 h-8"><AvatarFallback className="bg-secondary"><Bot size={16} /></AvatarFallback></Avatar>
                <div className="bg-secondary rounded-lg px-3 py-2 flex items-center">
                  <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            )}
          </CardContent>
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Input
                placeholder="Pergunte sobre cursos ou vagas..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send size={16} />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
}
