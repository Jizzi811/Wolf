'use client';

import { useCallback, useState } from 'react';
import { MicIcon, MicOffIcon, PhoneOffIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { AppConfig } from '@/app-config';
import { AmbientBackground } from '@/components/closer/ambient-background';
import { showMicError } from '@/components/closer/closer-error';
import { CloserHero } from '@/components/closer/closer-hero';
import { CloserOrb } from '@/components/closer/closer-orb';
import { CloserStatus } from '@/components/closer/closer-status';
import { Button } from '@/components/ui/button';
import { useSimpleVoiceAgent } from '@/hooks/useSimpleVoiceAgent';
import { CLOSER_CONTENT } from '@/lib/closer-content';
import { cn } from '@/lib/shadcn/utils';

interface CloserExperienceProps {
  appConfig: AppConfig;
}

export function CloserExperience({ appConfig: _appConfig }: CloserExperienceProps) {
  const {
    phase,
    isConnected,
    volume,
    transcript,
    micEnabled,
    startListening,
    stopSession,
    toggleMic,
  } = useSimpleVoiceAgent();
  const [starting, setStarting] = useState(false);

  const handleStart = useCallback(async () => {
    if (starting) return;
    setStarting(true);
    try {
      await startListening();
    } catch (error) {
      showMicError(error);
    } finally {
      setStarting(false);
    }
  }, [starting, startListening]);
