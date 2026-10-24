import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { demoConversations, demoMessages, type Conversation, type Message } from './messaging';

type UseMessagingResult = {
  conversations: Conversation[];
  usingDemo: boolean;
  loading: boolean;
  error: string | null;
  getMessages: (conversationId: string) => Promise<Message[]>;
  sendMessage: (conversationId: string, content: string) => Promise<{ error: string | null }>;
  markRead: (conversationId: string) => Promise<void>;
};

export function useMessaging(userId: string | undefined): UseMessagingResult {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!supabase || !userId) {
      setConversations(demoConversations);
      setUsingDemo(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (fetchError) {
      setError(fetchError.message);
      setConversations(demoConversations);
      setUsingDemo(true);
    } else if (!data || data.length === 0) {
      setConversations(demoConversations);
      setUsingDemo(true);
    } else {
      setConversations(data as Conversation[]);
      setUsingDemo(false);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  const getMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    if (conversationId.startsWith('demo-')) {
      return demoMessages[conversationId] ?? [];
    }
    if (!supabase) return [];
    const { data, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (fetchError) return [];
    return (data as Message[]) ?? [];
  }, []);

  const sendMessage = useCallback(
    async (conversationId: string, content: string): Promise<{ error: string | null }> => {
      const trimmed = content.trim();
      if (!trimmed) return { error: 'Message cannot be empty.' };
      if (trimmed.length > 2000) return { error: 'Message is too long (2000 characters max).' };

      if (conversationId.startsWith('demo-')) {
        const newMsg: Message = {
          id: 'local-' + Date.now(),
          conversation_id: conversationId,
          sender: 'customer',
          content: trimmed,
          read_by_customer: true,
          created_at: new Date().toISOString(),
        };
        demoMessages[conversationId] = [...(demoMessages[conversationId] ?? []), newMsg];
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, last_message: trimmed, last_message_at: newMsg.created_at }
              : c,
          ),
        );
        return { error: null };
      }

      if (!supabase) return { error: 'Database is not available.' };

      const { data: msgData, error: insertError } = await supabase
        .from('messages')
        .insert({ conversation_id: conversationId, sender: 'customer', content: trimmed })
        .select()
        .single();

      if (insertError) return { error: insertError.message };

      await supabase
        .from('conversations')
        .update({ last_message: trimmed, last_message_at: (msgData as Message).created_at })
        .eq('id', conversationId);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, last_message: trimmed, last_message_at: (msgData as Message).created_at }
            : c,
        ),
      );

      return { error: null };
    },
    [],
  );

  const markRead = useCallback(async (conversationId: string) => {
    if (conversationId.startsWith('demo-')) {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c)),
      );
      if (demoMessages[conversationId]) {
        demoMessages[conversationId] = demoMessages[conversationId].map((m) => ({
          ...m,
          read_by_customer: true,
        }));
      }
      return;
    }
    if (!supabase) return;
    await supabase
      .from('messages')
      .update({ read_by_customer: true })
      .eq('conversation_id', conversationId)
      .eq('sender', 'professional')
      .eq('read_by_customer', false);
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c)),
    );
  }, []);

  return { conversations, usingDemo, loading, error, getMessages, sendMessage, markRead };
}
