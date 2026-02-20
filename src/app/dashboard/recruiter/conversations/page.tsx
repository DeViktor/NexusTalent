
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
  candidateId: string;
  messages: Message[];
}

// Mock initial conversations
const initialConversations: Conversation[] = [
  {
    candidateId: 'student2',
    messages: [
      { sender: 'recruiter', text: 'Olá Bruno, obrigado pelo seu interesse na vaga de Gestor de Projetos. O seu perfil parece muito interessante.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      { sender: 'candidate', text: 'Olá, muito obrigado pelo contacto. Fico contente em saber!', timestamp: new Date(Date.now() - 1000 * 60 * 50 * 24) },
    ],
  },
   {
    candidateId: 'student5',
    messages: [
      { sender: 'recruiter', text: 'Bom dia Elisa. Analisámos o seu CV e gostaríamos de saber mais sobre a sua experiência com IFRS.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48) },
    ],
  },
];


const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export default function ConversationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const candidateIdToChat = searchParams.get('start_chat_with');
    if (candidateIdToChat) {
      // Check if a conversation already exists
      let convo = conversations.find(c => c.candidateId === candidateIdToChat);
      if (!convo) {
        // If not, create a new one
        convo = { candidateId: candidateIdToChat, messages: [] };
        setConversations(prev => [convo!, ...prev]);
      }
      setSelectedConversation(convo);
    }
  }, [searchParams, conversations]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !selectedConversation) return;

    const message: Message = {
      sender: 'recruiter',
      text: newMessage,
      timestamp: new Date(),
    };

    const updatedConversations = conversations.map(convo =>
      convo.candidateId === selectedConversation.candidateId
        ? { ...convo, messages: [...convo.messages, message] }
        : convo
    );

    setConversations(updatedConversations);
    setSelectedConversation(prev => prev ? { ...prev, messages: [...prev.messages, message] } : null);
    setNewMessage('');
  };

  const getCandidateProfile = (id: string): UserProfile | undefined => {
    return users.find(u => u.id === id);
  }

  const renderConversationList = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-headline text-2xl font-bold">Conversas</h2>
         <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pesquisar conversas..." className="pl-9" />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        {conversations.map(convo => {
          const candidate = getCandidateProfile(convo.candidateId);
          if (!candidate) return null;
          const lastMessage = convo.messages[convo.messages.length - 1];
          return (
            <div
              key={convo.candidateId}
              className={`p-4 border-b cursor-pointer hover:bg-secondary ${selectedConversation?.candidateId === convo.candidateId ? 'bg-secondary' : ''}`}
              onClick={() => setSelectedConversation(convo)}
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={candidate.profilePictureUrl} />
                  <AvatarFallback>{getInitials(`${candidate.firstName} ${candidate.lastName}`)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h3 className="font-semibold">{candidate.firstName} {candidate.lastName}</h3>
                  <p className="text-sm text-muted-foreground truncate">{lastMessage ? `${lastMessage.sender === 'recruiter' ? 'Você: ' : ''}${lastMessage.text}` : 'Nenhuma mensagem ainda'}</p>
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
  );

  const renderChatView = () => {
    if (!selectedConversation) return null;
    const candidate = getCandidateProfile(selectedConversation.candidateId);
    if (!candidate) return null;

    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
            <ArrowLeft />
          </Button>
          <Avatar>
            <AvatarImage src={candidate.profilePictureUrl} />
            <AvatarFallback>{getInitials(`${candidate.firstName} ${candidate.lastName}`)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{candidate.firstName} {candidate.lastName}</h2>
            <Link href={`/dashboard/recruiter/candidates/${candidate.id}`} className="text-xs text-primary hover:underline">Ver Perfil</Link>
          </div>
        </div>
        <div className="flex-grow p-4 overflow-y-auto bg-slate-50">
          <div className="space-y-4">
            {selectedConversation.messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'recruiter' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender === 'recruiter' ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
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
              placeholder="Escreva a sua mensagem..."
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
    );
  };
  
   const isChatOpen = !!selectedConversation;

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
        </Button>
        <div className="h-[calc(100vh-10rem)] border rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-3">
            <div className={`col-span-1 border-r ${isChatOpen ? 'hidden md:block' : 'block'}`}>
                {renderConversationList()}
            </div>
            <div className={`md:col-span-2 ${isChatOpen ? 'block' : 'hidden md:flex'} items-center justify-center bg-slate-50`}>
                {selectedConversation ? renderChatView() : (
                    <div className='text-center text-muted-foreground'>
                        <MessageSquare size={48} className='mx-auto mb-2'/>
                        <p>Selecione uma conversa para começar a conversar.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
