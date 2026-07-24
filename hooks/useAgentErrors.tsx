import { useEffect } from 'react';
import { useAgent, useSessionContext } from '@livekit/components-react';
import { showCloserError } from '@/components/closer/closer-error';

/**
 * Überwacht den Agentenzustand und zeigt bei einem Fehlschlag eine
 * nutzerfreundliche Meldung (Sektion 8). Es werden keine technischen
 * Rohfehler angezeigt; die Session wird anschließend sauber beendet.
 */
export function useAgentErrors() {
  const agent = useAgent();
  const { isConnected, end } = useSessionContext();

  useEffect(() => {
    if (isConnected && agent.state === 'failed') {
      showCloserError('agentUnreachable');
      end();
    }
  }, [agent, isConnected, end]);
}
