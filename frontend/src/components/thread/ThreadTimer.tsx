"use client"

import { useEffect, useState, useRef } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock } from "lucide-react"
import { getAgentRuns, AgentRun } from "@/lib/api"
import { toast } from 'sonner'

interface ThreadTimerProps {
  threadId: string
}

// Define a custom keyframes animation CSS
const pulseAnimation = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

export function ThreadTimer({ threadId }: ThreadTimerProps) {
  const [minutesUsed, setMinutesUsed] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isAgentRunning, setIsAgentRunning] = useState(false)
  const lastUpdateRef = useRef<number>(0)
  const lastMinutesRef = useRef<number>(0)
  
  // Ref to track the max minutes we've seen to prevent "going backwards"
  // Initialize from localStorage if available to persist across refreshes
  const maxMinutesSeenRef = useRef<number>(0) // Initialize with default value
  
  // Set the initial value from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`thread-timer-${threadId}`);
      if (stored) {
        const value = parseInt(stored, 10);
        maxMinutesSeenRef.current = value;
        // Initialize state with the stored value
        setMinutesUsed(value);
      }
    }
  }, [threadId])
  
  // Store the agent runs for continuous time calculation
  const agentRunsRef = useRef<AgentRun[]>([])
  
  // Store the last fetch time to avoid unnecessary API calls
  const lastFetchTimeRef = useRef<number>(0)
  
  // Track retry attempts for fetch failures
  const retryAttemptsRef = useRef<number>(0)
  
  // Calculate real-time minutes including active runs
  const calculateRealTimeMinutes = () => {
    if (!agentRunsRef.current || agentRunsRef.current.length === 0) return 0;
    
    let totalMinutes = 0;
    const currentTime = new Date().getTime();
    
    for (const run of agentRunsRef.current) {
      // For completed runs, use the exact time
      if (run.status === 'completed' && run.completed_at && run.started_at) {
        const startTime = new Date(run.started_at).getTime();
        const endTime = new Date(run.completed_at).getTime();
        
        if (startTime && endTime) {
          // Same formula as the backend: round up to nearest minute with minimum of 1
          const durationMs = endTime - startTime;
          const durationMinutes = Math.max(1, Math.ceil(durationMs / 60000));
          totalMinutes += durationMinutes;
        }
      }
      // For active runs, calculate real-time from start until now
      else if (run.status === 'running' && run.started_at) {
        const startTime = new Date(run.started_at).getTime();
        
        if (startTime) {
          // Real-time calculation using current timestamp
          const durationMs = currentTime - startTime;
          const durationMinutes = Math.max(1, Math.ceil(durationMs / 60000));
          totalMinutes += durationMinutes;
        }
      }
    }
    
    return totalMinutes;
  };
  
  // Save max minutes to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && minutesUsed > 0) {
      localStorage.setItem(`thread-timer-${threadId}`, maxMinutesSeenRef.current.toString());
    }
  }, [threadId, minutesUsed]);
  
  // Fetch time usage for this thread
  useEffect(() => {
    const fetchAgentRuns = async () => {
      try {
        const runs = await getAgentRuns(threadId);
        const totalMinutes = runs.reduce((acc, run) => {
          const startTime = new Date(run.started_at).getTime();
          const endTime = run.completed_at ? new Date(run.completed_at).getTime() : Date.now();
          const minutes = (endTime - startTime) / (1000 * 60);
          return acc + minutes;
        }, 0);

        // Only update if the new value is higher than the last stored value
        if (totalMinutes > lastMinutesRef.current) {
          lastMinutesRef.current = totalMinutes;
          setMinutesUsed(totalMinutes);
        }

        // Check if any agent is currently running
        const hasRunningAgent = runs.some(run => run.status === 'running');
        setIsAgentRunning(hasRunningAgent);
      } catch (error) {
        console.error('Error fetching agent runs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchAgentRuns();

    // Set up polling every 10 seconds
    const intervalId = setInterval(fetchAgentRuns, 10000);

    // Set up event listener for agent status changes
    const handleAgentStatusChange = (event: CustomEvent) => {
      const { status } = event.detail;
      setIsAgentRunning(status === 'running');
    };

    window.addEventListener('agent-status-change', handleAgentStatusChange as EventListener);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('agent-status-change', handleAgentStatusChange as EventListener);
    };
  }, [threadId]);
  
  // Update timer display every second if agent is running
  useEffect(() => {
    if (!isAgentRunning) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = (now - lastUpdateRef.current) / (1000 * 60); // Convert to minutes
      lastUpdateRef.current = now;

      setMinutesUsed(prev => prev + timeSinceLastUpdate);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isAgentRunning]);
  
  // Always render the component even while loading to reserve space in the layout
  if (isLoading) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-600 text-white text-sm">
            <Clock className="h-4 w-4" />
            <span>{Math.round(minutesUsed)}m</span>
            {isAgentRunning && (
              <style>{pulseAnimation}</style>
            )}
            {isAgentRunning && (
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Total time used by agents in this thread</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 