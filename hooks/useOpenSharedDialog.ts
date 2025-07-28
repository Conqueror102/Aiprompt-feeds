'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface PromptData {
  _id: string;
  title: string;
  content: string;
  description?: string;
  aiAgents: string[];
  category: string;
  createdBy: {
    _id: string;
    name: string;
  };
  likes: number;
  saves: number;
  rating?: number;
  createdAt: string;
}

type FetchPromptByIdFn = (id: string) => PromptData | undefined;

export const useOpenSharedDialog = (
  fetchPromptById: FetchPromptByIdFn,
  apiFallbackUrl: string = '/api/prompts'
) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sharedPrompt, setSharedPrompt] = useState<PromptData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const promptId = searchParams.get('prompt');
    if (promptId) {
      const localPrompt = fetchPromptById(promptId);
      if (localPrompt) {
        setSharedPrompt(localPrompt);
      } else {
        // Fallback to fetch from API
        setLoading(true);
        fetch(`${apiFallbackUrl}/${promptId}`)
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch prompt');
            return res.json();
          })
          .then(data => {
            setSharedPrompt(data);
          })
          .catch(err => {
            console.error('Error fetching prompt from API:', err);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [searchParams, apiFallbackUrl]);

  const closeDialog = () => {
    setSharedPrompt(null);
    const current = new URLSearchParams(searchParams.toString());
    current.delete('prompt');
    router.push(`?${current.toString()}`, { scroll: false });
  };

  return {
    sharedPrompt,
    closeDialog,
    loading,
  };
}; 