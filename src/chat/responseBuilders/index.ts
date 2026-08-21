import { SlashCommandType } from '../commandSchemas';

/**
 * Builds or formats the final string response for RazorFlow operational commands.
 */
export function buildCommandResponse(command: SlashCommandType, rawResponse: string): string {
  return rawResponse.trim();
}
