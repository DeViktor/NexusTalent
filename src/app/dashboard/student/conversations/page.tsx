'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { users } from '@/lib/users';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Search, MessageSquare } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import Link from 'next/link';

interface Message {
  sender: 'recruiter' | 'candidate';
  text: string;
  timestamp: Date;
}

interface Conversation {
  recruiterId: string;
  messages: Message[];
}

// Mock initial conversations from a student's perspective
const initialConversations: Conversation[] = [
  {
    recruiterId: 'recruiter-test-id',
    messages: [
      { sender: 'recruiter', text: 'Olá, obrigado pelo seu interesse na vaga. O seu perfil parece muito interessante.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      { sender: 'candidate', text: 'Olá, muito obrigado pelo contacto. Fico contente em saber!', timestamp: new Date(Date.now() - 1000 * 60 * 50 * 24) },
      { sender: 'recruiter', text: 'Gostaríamos de agendar uma breve conversa. Teria disponibilidade amanhã à tarde?', timestamp: new Date(Date.now() - 1000 * 60 * 30)},
    ],
  },
];


const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export default function StudentConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0] || null);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !selectedConversation) return;

    const message: Message = {
      sender: 'candidate',
      text: newMessage,
      timestamp: new Date(),
    };

    const updatedConversations = conversations.map(convo =>
      convo.recruiterId === selectedConversation.recruiterId
        ? { ...convo, messages: [...convo.messages, message] }
        : convo
    );

    setConversations(updatedConversations);
    setSelectedConversation(prev => prev ? { ...prev, messages: [...prev.messages, message] } : null);
    setNewMessage('');
  };

  const getRecruiterProfile = (id: string): UserProfile | undefined => {
    return users.find(u => u.id === id);
  }
  
  const isChatOpen = !!selectedConversation;

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Painel
        </Button>
        <div className="h-[calc(100vh-12rem)] border rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-3">
            <div className={`col-span-1 border-r ${isChatOpen ? 'hidden md:block' : 'block'}`}>
                 <div className="flex flex-col h-full">
                    <div className="p-4 border-b">
                        <h2 className="font-headline text-2xl font-bold">Mensagens</h2>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {conversations.map(convo => {
                        const recruiter = getRecruiterProfile(convo.recruiterId);
                        if (!recruiter) return null;
                        const lastMessage = convo.messages[convo.messages.length - 1];
                        return (
                            <div
                            key={convo.recruiterId}
                            className={`p-4 border-b cursor-pointer hover:bg-secondary ${selectedConversation?.recruiterId === convo.recruiterId ? 'bg-secondary' : ''}`}
                            onClick={() => setSelectedConversation(convo)}
                            >
                            <div className="flex items-center gap-4">
                                <Avatar>
                                <AvatarImage src={recruiter.profilePictureUrl} />
                                <AvatarFallback>{getInitials(`${recruiter.firstName} ${recruiter.lastName}`)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                <h3 className="font-semibold">{recruiter.firstName} {recruiter.lastName}</h3>
                                <p className="text-sm text-muted-foreground truncate">{lastMessage ? `${lastMessage.sender === 'candidate' ? 'Você: ' : ''}${lastMessage.text}` : 'Nenhuma mensagem ainda'}</p>
                                </div>
                                <div className="text-xs text-muted-foreground text-right">
                                {lastMessage && new Date(lastMessage.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                            </div>
                        );
                        })}
                    </div>
                </div>
            </div>
            <div className={`md:col-span-2 ${isChatOpen ? 'block' : 'hidden md:flex'} items-center justify-center bg-slate-50`}>
                {selectedConversation ? (() => {
                     const recruiter = getRecruiterProfile(selectedConversation.recruiterId);
                     if (!recruiter) return null;
                     return (
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                                <ArrowLeft />
                            </Button>
                            <Avatar>
                                <AvatarImage src={recruiter.profilePictureUrl} />
                                <AvatarFallback>{getInitials(`${recruiter.firstName} ${recruiter.lastName}`)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-semibold">{recruiter.firstName} {recruiter.lastName}</h2>
                                <p className="text-xs text-muted-foreground">Recrutador</p>
                            </div>
                            </div>
                            <div className="flex-grow p-4 overflow-y-auto bg-slate-50">
                            <div className="space-y-4">
                                {selectedConversation.messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender === 'candidate' ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                    <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                ))}
                            </div>
                            </div>
                            <div className="p-4 border-t bg-background">
                            <div className="flex items-center gap-2">
                                <Input
                                placeholder="Escreva a sua resposta..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button onClick={handleSendMessage}>
                                <Send className="h-4 w-4" />
                                </Button>
                            </div>
                            </div>
                        </div>
                     )
                })() : (
                    <div className='text-center text-muted-foreground'>
                        <MessageSquare size={48} className='mx-auto mb-2'/>
                        <p>Selecione uma conversa para ver as mensagens.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
