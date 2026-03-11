'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Search, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

type ListConversation = {
  id: string;
  recruiterId: string;
  recruiterName: string;
  recruiterAvatarUrl?: string | null;
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
};

type ConversationDetail = {
  id: string;
  recruiter: { id: string; name: string; avatarUrl?: string | null };
  messages: { id: string; sender: 'candidate' | 'recruiter'; text: string; timestamp: string }[];
};

export default function StudentConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ListConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/student/conversations', { cache: 'no-store', credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao carregar conversas.');
      const rows: ListConversation[] = Array.isArray(json.conversations) ? json.conversations : [];
      setConversations(rows);
      const first = rows[0]?.id || null;
      setSelectedConversationId((prev) => prev || first);
    } catch {
      setConversations([]);
      setSelectedConversationId(null);
      setConversation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/student/conversations/${id}`, { cache: 'no-store', credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao carregar conversa.');
      setConversation(json.conversation as ConversationDetail);
    } catch {
      setConversation(null);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      setConversation(null);
      return;
    }
    loadConversation(selectedConversationId);
  }, [selectedConversationId]);

  const handleSendMessage = async () => {
    if (!selectedConversationId) return;
    const text = newMessage.trim();
    if (!text) return;
    if (isSending) return;
    setIsSending(true);
    try {
      const res = await fetch(`/api/student/conversations/${selectedConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Falha ao enviar mensagem.');
      setNewMessage('');
      await Promise.all([loadConversation(selectedConversationId), loadConversations()]);
    } finally {
      setIsSending(false);
    }
  };
  
  const isChatOpen = !!selectedConversationId;
  const filtered = !search.trim()
    ? conversations
    : conversations.filter((c) => {
        const s = search.trim().toLowerCase();
        return c.recruiterName.toLowerCase().includes(s) || (c.lastMessageText || '').toLowerCase().includes(s);
      });

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
                    <div className="p-4 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar..." className="pl-9" />
                      </div>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {isLoading ? (
                          <div className="p-4 text-sm text-muted-foreground">A carregar...</div>
                        ) : filtered.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground">Nenhuma conversa.</div>
                        ) : (
                          filtered.map(convo => {
                            const lastDate = convo.lastMessageAt ? new Date(convo.lastMessageAt) : null;
                            return (
                              <div
                                key={convo.id}
                                className={`p-4 border-b cursor-pointer hover:bg-secondary ${selectedConversationId === convo.id ? 'bg-secondary' : ''}`}
                                onClick={() => setSelectedConversationId(convo.id)}
                              >
                                <div className="flex items-center gap-4">
                                  <Avatar>
                                    <AvatarImage src={convo.recruiterAvatarUrl || undefined} />
                                    <AvatarFallback>{getInitials(convo.recruiterName)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-grow">
                                    <h3 className="font-semibold">{convo.recruiterName}</h3>
                                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessageText || 'Nenhuma mensagem ainda'}</p>
                                  </div>
                                  <div className="text-xs text-muted-foreground text-right">
                                    {lastDate ? lastDate.toLocaleDateString() : ''}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                    </div>
                </div>
            </div>
            <div className={`md:col-span-2 ${isChatOpen ? 'block' : 'hidden md:flex'} items-center justify-center bg-slate-50`}>
                {conversation ? (() => {
                     const recruiter = conversation.recruiter;
                     return (
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversationId(null)}>
                                <ArrowLeft />
                            </Button>
                            <Avatar>
                                <AvatarImage src={recruiter.avatarUrl || undefined} />
                                <AvatarFallback>{getInitials(recruiter.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-semibold">{recruiter.name}</h2>
                                <p className="text-xs text-muted-foreground">Recrutador</p>
                            </div>
                            </div>
                            <div className="flex-grow p-4 overflow-y-auto bg-slate-50">
                            <div className="space-y-4">
                                {conversation.messages.map((msg) => {
                                  const time = msg.timestamp ? new Date(msg.timestamp) : null;
                                  return (
                                    <div key={msg.id} className={`flex ${msg.sender === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender === 'candidate' ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                        <p className="text-xs opacity-70 mt-1 text-right">
                                          {time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
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
                                <Button onClick={handleSendMessage} disabled={isSending}>
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
