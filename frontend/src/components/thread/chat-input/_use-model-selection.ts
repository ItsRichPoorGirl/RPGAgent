'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

export const STORAGE_KEY_MODEL = 'suna-preferred-model';
export const DEFAULT_FREE_MODEL_ID = 'qwen35';
export const DEFAULT_PREMIUM_MODEL_ID = 'sonnet-3.7';

export type SubscriptionStatus = 'no_subscription' | 'active';

export const MODEL_OPTIONS = [
  {
    id: 'anthropic/claude-3-7-sonnet-latest',
    name: 'Standard',
    description: 'Best for most tasks',
    requiresSubscription: true,
  },
  {
    id: 'qwen3',
    name: 'Free',
    description: 'Basic capabilities',
    requiresSubscription: false,
  },
] as const;

export type ModelOption = (typeof MODEL_OPTIONS)[number];

export const canAccessModel = (
  subscriptionStatus: SubscriptionStatus,
  requiresSubscription: boolean,
): boolean => {
  return subscriptionStatus === 'active' || !requiresSubscription;
};

export function useModelSelection() {
  const { data: subscriptionData } = useSubscription();
  const { user } = useAuth();
  
  // Check if user is an admin
  const isAdmin = user?.user_metadata?.account_role === 'admin';

  // If user is admin, they can use any model
  const availableModels = isAdmin 
    ? MODEL_OPTIONS 
    : MODEL_OPTIONS.filter(model => !model.requiresSubscription || subscriptionData?.status === 'active');

  const [selectedModel, setSelectedModel] = useState<ModelOption>(availableModels[0]);

  // Update selected model when available models change
  useEffect(() => {
    // If current selection is no longer available, switch to first available model
    if (!availableModels.find(m => m.id === selectedModel.id)) {
      setSelectedModel(availableModels[0]);
    }
  }, [availableModels, selectedModel.id]);

  const handleModelChange = useCallback((modelId: string) => {
    const model = MODEL_OPTIONS.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
    }
  }, []);

  return {
    selectedModel,
    handleModelChange,
    availableModels,
  };
}

export const useModelSelectionOld = () => {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_FREE_MODEL_ID);
  
  const { data: subscriptionData } = useSubscription();
  
  const subscriptionStatus: SubscriptionStatus = subscriptionData?.status === 'active' 
    ? 'active' 
    : 'no_subscription';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedModel = localStorage.getItem(STORAGE_KEY_MODEL);
      
      if (subscriptionStatus === 'active') {
        if (savedModel) {
          const modelOption = MODEL_OPTIONS.find(option => option.id === savedModel);
          if (modelOption && canAccessModel(subscriptionStatus, modelOption.requiresSubscription)) {
            setSelectedModel(savedModel);
            return;
          }
        }
        
        setSelectedModel(DEFAULT_PREMIUM_MODEL_ID);
        try {
          localStorage.setItem(STORAGE_KEY_MODEL, DEFAULT_PREMIUM_MODEL_ID);
        } catch (error) {
          console.warn('Failed to save model preference to localStorage:', error);
        }
      } 
      else if (savedModel) {
        const modelOption = MODEL_OPTIONS.find(option => option.id === savedModel);
        if (modelOption && canAccessModel(subscriptionStatus, modelOption.requiresSubscription)) {
          setSelectedModel(savedModel);
        } else {
          localStorage.removeItem(STORAGE_KEY_MODEL);
          setSelectedModel(DEFAULT_FREE_MODEL_ID);
        }
      }
      else {
        setSelectedModel(DEFAULT_FREE_MODEL_ID);
      }
    } catch (error) {
      console.warn('Failed to load preferences from localStorage:', error);
    }
  }, [subscriptionStatus]);

  const handleModelChange = (modelId: string) => {
    const modelOption = MODEL_OPTIONS.find(option => option.id === modelId);
    
    if (!modelOption || !canAccessModel(subscriptionStatus, modelOption.requiresSubscription)) {
      return;
    }
    
    setSelectedModel(modelId);
    try {
      localStorage.setItem(STORAGE_KEY_MODEL, modelId);
    } catch (error) {
      console.warn('Failed to save model preference to localStorage:', error);
    }
  };

  return {
    selectedModel,
    setSelectedModel: handleModelChange,
    subscriptionStatus,
    availableModels: MODEL_OPTIONS.filter(model => 
      canAccessModel(subscriptionStatus, model.requiresSubscription)
    ),
    allModels: MODEL_OPTIONS,
    canAccessModel: (modelId: string) => {
      const model = MODEL_OPTIONS.find(m => m.id === modelId);
      return model ? canAccessModel(subscriptionStatus, model.requiresSubscription) : false;
    },
    isSubscriptionRequired: (modelId: string) => {
      return MODEL_OPTIONS.find(m => m.id === modelId)?.requiresSubscription || false;
    }
  };
};