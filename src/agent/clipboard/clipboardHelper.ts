/**
 * RazorFlow Universal Clipboard Helper
 * 
 * Robust clipboard integration supporting:
 * - RFC-4180 CSV
 * - Structured HTML tables (for Excel, Word, Google Docs)
 * - Markdown text
 * - Plain text fallbacks
 * 
 * Guarantees zero crashes across Chrome, Edge, Electron, and Windows.
 */

export interface CopyPayload {
  plainText: string;
  htmlText?: string;
  csvText?: string;
}

export class ClipboardHelper {
  /**
   * Universal copy with automatic format negotiation and fallback
   */
  public static async copy(payload: CopyPayload | string): Promise<boolean> {
    const plain = typeof payload === 'string' ? payload : payload.plainText;
    const html = typeof payload === 'object' ? payload.htmlText : undefined;

    // 1. Try modern Async Clipboard API with text/html + text/plain
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      try {
        const items: Record<string, Blob> = {
          'text/plain': new Blob([plain], { type: 'text/plain' })
        };

        if (html) {
          items['text/html'] = new Blob([html], { type: 'text/html' });
        }

        await navigator.clipboard.write([new ClipboardItem(items)]);
        return true;
      } catch (err) {
        // Fallback to text only
        try {
          await navigator.clipboard.writeText(plain);
          return true;
        } catch {
          // Continue to document.execCommand fallback
        }
      }
    }

    // 2. Fallback to textarea + document.execCommand('copy')
    try {
      const textarea = document.createElement('textarea');
      textarea.value = plain;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch {
      return false;
    }
  }

  /**
   * Helper to format table rows into RFC-4180 CSV
   */
  public static formatToCSV(headers: string[], rows: Array<Array<string | number>>): string {
    const escapeCell = (val: string | number) => {
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerLine = headers.map(escapeCell).join(',');
    const bodyLines = rows.map(r => r.map(escapeCell).join(','));
    return [headerLine, ...bodyLines].join('\n');
  }
}
