
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Search, MessageSquare } from 'lucide-react';
import Link from 'next/link';

type ApiListConversation = {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatarUrl?: string | null;
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
  updatedAt: string;
};

type ApiConversation = {
  id: string;
  candidate: { id: string; name: string; avatarUrl?: string | null };
  messages: { id: string; sender: 'recruiter' | 'candidate'; text: string; timestamp: string }[];
};

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export default function ConversationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [conversations, setConversations] = useState<ApiListConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ApiConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setIsLoadingList(true);
        const res = await fetch('/api/recruiter/conversations', { cache: 'no-store', credentials: 'include' });
        const json = await res.json();
        if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao carregar conversas.');
        if (!active) return;
        setConversations(Array.isArray(json.conversations) ? json.conversations : []);
      } catch {
        if (!active) return;
        setConversations([]);
      } finally {
        if (active) setIsLoadingList(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const loadConversation = async (conversationId: string) => {
    setIsLoadingChat(true);
    try {
      const res = await fetch(`/api/recruiter/conversations/${conversationId}`, { cache: 'no-store', credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao carregar conversa.');
      setSelectedConversation(json.conversation as ApiConversation);
    } finally {
      setIsLoadingChat(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const candidateIdToChat = searchParams.get('start_chat_with');
      if (!candidateIdToChat) return;
      try {
        const res = await fetch('/api/recruiter/conversations/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ candidateId: candidateIdToChat }),
        });
        const json = await res.json();
        if (!res.ok || !json?.ok) return;
        if (!active) return;
        const conversationId = String(json.conversationId);
        await loadConversation(conversationId);
        const listRes = await fetch('/api/recruiter/conversations', { cache: 'no-store', credentials: 'include' });
        const listJson = await listRes.json();
        if (listRes.ok && listJson?.ok) setConversations(Array.isArray(listJson.conversations) ? listJson.conversations : []);
      } catch {
        if (!active) return;
      }
    })();
    return () => { active = false; };
  }, [searchParams]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !selectedConversation || isSending) return;
    const conversationId = selectedConversation.id;
    const text = newMessage.trim();
    setIsSending(true);
    (async () => {
      try {
        const res = await fetch(`/api/recruiter/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ text }),
        });
        const json = await res.json();
        if (!res.ok || !json?.ok) return;
        setNewMessage('');
        await loadConversation(conversationId);
        const listRes = await fetch('/api/recruiter/conversations', { cache: 'no-store', credentials: 'include' });
        const listJson = await listRes.json();
        if (listRes.ok && listJson?.ok) setConversations(Array.isArray(listJson.conversations) ? listJson.conversations : []);
      } finally {
        setIsSending(false);
      }
    })();
  };

  const filteredConversations = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return conversations;
    return conversations.filter((c) => {
      const name = String(c.candidateName || '').toLowerCase();
      const msg = String(c.lastMessageText || '').toLowerCase();
      return name.includes(t) || msg.includes(t);
    });
  }, [conversations, searchTerm]);

  const renderConversationList = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-headline text-2xl font-bold">Conversas</h2>
         <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pesquisar conversas..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        {isLoadingList ? (
          <div className="p-4 text-sm text-muted-foreground">A carregar...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">Nenhuma conversa.</div>
        ) : filteredConversations.map(convo => {
          return (
            <div
              key={convo.id}
              className={`p-4 border-b cursor-pointer hover:bg-secondary ${selectedConversation?.candidateId === convo.candidateId ? 'bg-secondary' : ''}`}
              onClick={() => loadConversation(convo.id)}
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={convo.candidateAvatarUrl ?? undefined} />
                  <AvatarFallback>{getInitials(convo.candidateName)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h3 className="font-semibold">{convo.candidateName}</h3>
                  <p className="text-sm text-muted-foreground truncate">{convo.lastMessageText ? convo.lastMessageText : 'Nenhuma mensagem ainda'}</p>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {convo.lastMessageAt && new Date(convo.lastMessageAt).toLocaleDateString()}
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
    const candidate = selectedConversation.candidate;

    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
            <ArrowLeft />
          </Button>
          <Avatar>
            <AvatarImage src={candidate.avatarUrl ?? undefined} />
            <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{candidate.name}</h2>
            <Link href={`/dashboard/recruiter/candidates/${candidate.id}`} className="text-xs text-primary hover:underline">Ver Perfil</Link>
          </div>
        </div>
        <div className="flex-grow p-4 overflow-y-auto bg-slate-50">
          <div className="space-y-4">
            {isLoadingChat ? (
              <div className="text-sm text-muted-foreground">A carregar...</div>
            ) : selectedConversation.messages.length === 0 ? (
              <div className="text-sm text-muted-foreground">Sem mensagens ainda.</div>
            ) : selectedConversation.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'recruiter' ? 'justify-end' : 'justify-start'}`}>
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
              disabled={isSending}
            />
            <Button onClick={handleSendMessage} disabled={isSending}>
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
