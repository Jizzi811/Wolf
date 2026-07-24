import { Agent, inference } from '@livekit/agents';
import { config } from './config.ts';
import { formatKnowledgeForPrompt } from './knowledge/kickstartercash.ts';
import { CLOSER_SYSTEM_PROMPT } from './prompts/closer-system-prompt.ts';
import { LEAD_CAPTURE_ENABLED, createLeadCaptureTool } from './tools/lead-capture.ts';

/**
 * Baut den CLOSER-Agenten (Sektion 10 & 12).
 *
 * Der Systemprompt lebt in `prompts/closer-system-prompt.ts`, die freigegebene
 * Wissensbasis in `knowledge/kickstartercash.ts`. Das Sprachmodell ist über
 * `config.ts` austauschbar. Die Lead-Erfassung ist standardmäßig deaktiviert.
 */
export function createAgent() {
  const instructions = [
    CLOSER_SYSTEM_PROMPT,
    '',
    formatKnowledgeForPrompt(),
    '',
    `Sprich standardmäßig ${config.language === 'de' ? 'Deutsch' : config.language} und passe dich der Sprache des Nutzers an.`,
    'Antworte kurz, natürlich und für Sprachausgabe optimiert.',
  ].join('\n');

  // Lead-Erfassung nur einbinden, wenn ausdrücklich aktiviert (Sektion 15).
  const tools = LEAD_CAPTURE_ENABLED ? [createLeadCaptureTool()] : [];

  return Agent.create({
    instructions,
    // Das LLM ("Gehirn") des Agenten. Modell über config.ts / Env austauschbar.
    llm: new inference.LLM({ model: config.llm.model }),
    ...(tools.length > 0 ? { tools } : {}),
  });
}
