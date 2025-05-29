export const dynamic = 'force-dynamic';
export const revalidate = 0;

'use client';

import React, { useState, Suspense, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import {
  ChatInput,
  ChatInputHandles,
} from '@/components/thread/chat-input/chat-input';
import {
  BillingError,
} from '@/lib/api';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBillingError } from '@/hooks/useBillingError';
import { BillingErrorAlert } from '@/components/billing/usage-limit-alert';
import { useAccounts } from '@/hooks/use-accounts';
import { config } from '@/lib/config';
import { cn } from '@/lib/utils';
import { useInitiateAgentWithInvalidation } from '@/hooks/react-query/dashboard/use-initiate-agent';
import { ModalProviders } from '@/providers/modal-providers';
import { useModal } from '@/hooks/use-modal-store';
import { Examples } from './_components/suggestions/examples';
import { ErrorBoundary } from '@/components/error-boundary';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';

const PENDING_PROMPT_KEY = 'pendingAgentPrompt';
const SUBMISSION_COOLDOWN = 2000; // 2 seconds cooldown between submissions

function DashboardContent() {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const { billingError, handleBillingError, clearBillingError } = useBillingError();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();
  const { data: accounts } = useAccounts();
  const personalAccount = accounts?.find((account) => account.personal_account);
  const chatInputRef = useRef<ChatInputHandles>(null);
  const initiateAgentMutation = useInitiateAgentWithInvalidation();
  const { onOpen } = useModal();
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const [pendingPrompt, setPendingPrompt] = useLocalStorage(PENDING_PROMPT_KEY, '');
  const debouncedInputValue = useDebounce(inputValue, 300);

  const handleSubmit = async (
    message: string,
    options?: {
      model_name?: string;
      enable_thinking?: boolean;
      reasoning_effort?: string;
      stream?: boolean;
      enable_context_manager?: boolean;
    },
  ) => {
    if (!message.trim() && !chatInputRef.current?.getPendingFiles().length) {
      toast.error('Please enter a message or attach a file');
      return;
    }

    if (isSubmitting) {
      toast.error('Please wait for the current submission to complete');
      return;
    }

    const now = Date.now();
    if (now - lastSubmissionTime < SUBMISSION_COOLDOWN) {
      toast.error('Please wait a moment before submitting again');
      return;
    }

    setIsSubmitting(true);
    setLastSubmissionTime(now);

    try {
      const files = chatInputRef.current?.getPendingFiles() || [];
      setPendingPrompt(''); // Clear pending prompt

      const formData = new FormData();
      formData.append('prompt', message);

      files.forEach((file, index) => {
        formData.append('files', file, file.name);
      });

      if (options?.model_name) formData.append('model_name', options.model_name);
      formData.append('enable_thinking', String(options?.enable_thinking ?? false));
      formData.append('reasoning_effort', options?.reasoning_effort ?? 'low');
      formData.append('stream', String(options?.stream ?? true));
      formData.append('enable_context_manager', String(options?.enable_context_manager ?? false));

      const result = await initiateAgentMutation.mutateAsync(formData);

      if (result.thread_id) {
        router.push(`/agents/${result.thread_id}`);
      } else {
        throw new Error('Agent initiation did not return a thread_id.');
      }
      chatInputRef.current?.clearPendingFiles();
    } catch (error: any) {
      console.error('Error during submission process:', error);
      if (error instanceof BillingError) {
        onOpen("paymentRequiredDialog");
      } else {
        toast.error('An error occurred while processing your request');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (pendingPrompt) {
      setInputValue(pendingPrompt);
      setAutoSubmit(true);
    }
  }, [pendingPrompt]);

  useEffect(() => {
    if (autoSubmit && debouncedInputValue && !isSubmitting) {
      handleSubmit(debouncedInputValue);
      setAutoSubmit(false);
    }
  }, [autoSubmit, debouncedInputValue, isSubmitting]);

  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please try refreshing the page.</div>}>
      <ModalProviders />
      <div className="flex flex-col h-screen w-full">
        {isMobile && (
          <div className="absolute top-4 left-4 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setOpenMobile(true)}
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open menu</TooltipContent>
            </Tooltip>
          </div>
        )}

        <div className={cn(
          "flex-1 flex flex-col items-center justify-center px-4",
          "lg:justify-center",
          "sm:justify-center sm:px-6"
        )}>
          <div className={cn(
            "flex flex-col items-center text-center w-full",
            "max-w-full",
            "sm:max-w-3xl"
          )}>
            <h1 className={cn(
              'tracking-tight font-semibold leading-tight',
              'text-3xl',
              'sm:text-4xl'
            )}>
              Hey
            </h1>
            <p className={cn(
              "tracking-tight font-normal text-muted-foreground/80 mt-2 flex items-center gap-2",
              "text-2xl",
              "sm:text-3xl sm:mt-3 sm:px-4"
            )}>
              What would you like Luciq to do today?
            </p>
          </div>
          
          <div className={cn(
            "w-full mb-2",
            "max-w-full",
            "sm:max-w-3xl"
          )}>
            <ChatInput
              ref={chatInputRef}
              onSubmit={handleSubmit}
              loading={isSubmitting}
              placeholder="Describe what you need help with..."
              value={inputValue}
              onChange={setInputValue}
              hideAttachments={false}
            />
          </div>
          
          <Examples onSelectPrompt={setInputValue} />
        </div>

        <BillingErrorAlert
          message={billingError?.message}
          currentUsage={billingError?.currentUsage}
          limit={billingError?.limit}
          accountId={personalAccount?.account_id}
          onDismiss={clearBillingError}
          isOpen={!!billingError}
        />
      </div>
    </ErrorBoundary>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-full w-full">
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className={cn(
              "flex flex-col items-center text-center w-full space-y-8",
              "max-w-[850px] sm:max-w-full sm:px-4"
            )}>
              <Skeleton className="h-10 w-40 sm:h-8 sm:w-32" />
              <Skeleton className="h-7 w-56 sm:h-6 sm:w-48" />
              <Skeleton className="w-full h-[100px] rounded-xl sm:h-[80px]" />
              <div className="block sm:hidden lg:block w-full">
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}