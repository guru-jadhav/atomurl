/**
 * Cross-platform clipboard helper.
 * Works seamlessly in:
 * - Desktop, Tablet, and Mobile
 * - Secure Contexts (HTTPS, localhost)
 * - Insecure Contexts (HTTP over LAN/Hotspot IP e.g. 10.39.39.161)
 */
export async function copyToClipboard(text) {
  if (!text) return false;

  // 1. Try modern navigator.clipboard if available (Requires HTTPS or localhost)
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard failed, attempting fallback copy:', err);
    }
  }

  // 2. Fallback for HTTP / Mobile LAN / Hotspot using execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Avoid scrolling or keyboard pop-up on mobile
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);

    // iOS and Android text range selection
    textArea.focus({ preventScroll: true });
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return !!successful;
  } catch (err) {
    console.error('All clipboard copy attempts failed:', err);
    return false;
  }
}
