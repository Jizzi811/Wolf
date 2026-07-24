import { describe, expect, it } from 'vitest';
import { config } from './config.ts';
import {
  KICKSTARTERCASH_KNOWLEDGE,
  formatKnowledgeForPrompt,
} from './knowledge/kickstartercash.ts';
import { CLOSER_SYSTEM_PROMPT } from './prompts/closer-system-prompt.ts';
import { LEAD_CAPTURE_ENABLED } from './tools/lead-capture.ts';

/**
 * Diese Tests prüfen die statische Konfiguration und die Leitplanken von CLOSER.
 * Sie benötigen keine externen Zugangsdaten und laufen ohne LiveKit-Verbindung.
 * Verhaltenstests mit echter Sprachpipeline erfordern eine LiveKit-Cloud-Session
 * und sind in SETUP-CLOSER.md beschrieben.
 */
describe('CLOSER-Systemprompt', () => {
  it('enthält die Identität und die Standardbegrüßung', () => {
    expect(CLOSER_SYSTEM_PROMPT).toContain('Du bist CLOSER');
    expect(CLOSER_SYSTEM_PROMPT).toContain('Johann');
    expect(CLOSER_SYSTEM_PROMPT).toContain('Da bist du ja. Ich bin CLOSER');
  });

  it('stellt klar, dass CLOSER keine reale Person ist', () => {
    expect(CLOSER_SYSTEM_PROMPT).toContain('keine Kopie und keine Nachahmung einer realen Person');
    expect(CLOSER_SYSTEM_PROMPT).toContain('Jordan Belfort');
    expect(CLOSER_SYSTEM_PROMPT).toMatch(/behauptest niemals, Jordan Belfort/);
  });

  it('verbietet erfundene KickstarterCash-Angaben', () => {
    expect(CLOSER_SYSTEM_PROMPT).toContain('Erfinde keine');
  });
});

describe('CLOSER-Konfiguration', () => {
  it('spricht standardmäßig Deutsch und heißt CLOSER', () => {
    expect(config.language).toBe('de');
    expect(config.agentName.length).toBeGreaterThan(0);
  });

  it('liefert die Standardbegrüßung', () => {
    expect(config.greeting).toContain('CLOSER');
  });

  it('hat austauschbare Modell- und Stimmenwerte', () => {
    expect(config.llm.model.length).toBeGreaterThan(0);
    expect(config.stt.model.length).toBeGreaterThan(0);
    expect(config.tts.model.length).toBeGreaterThan(0);
    expect(config.tts.voice.length).toBeGreaterThan(0);
  });
});

describe('Wissensbasis (Platzhalter)', () => {
  it('enthält ohne geprüfte Daten einen ehrlichen Hinweis', () => {
    const text = formatKnowledgeForPrompt();
    expect(text).toContain('KEINE geprüften');
  });

  it('erfindet keine Preise oder Garantien', () => {
    expect(KICKSTARTERCASH_KNOWLEDGE.products.entries).toHaveLength(0);
    expect(KICKSTARTERCASH_KNOWLEDGE.companyDescription.entries).toHaveLength(0);
  });
});

describe('Lead-Erfassung', () => {
  it('ist standardmäßig deaktiviert', () => {
    expect(LEAD_CAPTURE_ENABLED).toBe(false);
  });
});
