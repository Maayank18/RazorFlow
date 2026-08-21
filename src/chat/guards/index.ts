import { SlashCommandType } from '../commandSchemas';

/**
 * Guards validate the output to ensure the LLM didn't break operational rules.
 */
export function validateCommandResponse(command: SlashCommandType, response: string): boolean {
  if (!response || response.trim() === '') return false;

  // Operational responses should never be empty
  if (command === 'investigate' && response.length < 20) {
    console.warn(`[Command Guard] investigate response was too brief.`);
  }

  return true;
}
