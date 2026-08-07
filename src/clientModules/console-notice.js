/**
 * Self-XSS warning printed to the browser console.
 *
 * This is not decoration. Attackers talk people into pasting code into the
 * devtools console, which runs it with full access to the current session —
 * the same class of attack Facebook, Google and Discord print this warning
 * for. The message costs nothing and occasionally stops someone.
 *
 * Shipped as a client module rather than an inline <script> on purpose: the
 * site's CSP is `script-src 'self'`, so an inline script would require a hash
 * or a nonce. A client module is bundled and served from the same origin.
 */

const WARNING_STYLE = [
  'color:#22C55E',
  'font-family:"JetBrains Mono",ui-monospace,monospace',
  'font-size:15px',
  'font-weight:700',
].join(';');

const BODY_STYLE = [
  'color:#94A3B8',
  'font-family:"JetBrains Mono",ui-monospace,monospace',
  'font-size:12px',
  'line-height:1.6',
].join(';');

export function onRouteDidUpdate() {
  // No-op: the notice is printed once on load, not per navigation.
}

if (
  typeof window !== 'undefined' &&
  process.env.NODE_ENV === 'production'
) {
  // eslint-disable-next-line no-console
  console.log('%c⚠  Stop.', WARNING_STYLE);
  // eslint-disable-next-line no-console
  console.log(
    '%cIf someone told you to paste something here, it is an attempt to take\n' +
      'over your account. Pasting code into this console gives it full access\n' +
      'to your session on this site.\n\n' +
      'https://en.wikipedia.org/wiki/Self-XSS\n\n' +
      '────────────────────────────────────────────────────────────\n' +
      'Curious how this site is built and secured?\n' +
      '  → /docs/projects/devsecops-blog\n' +
      '  → /.well-known/security.txt',
    BODY_STYLE
  );
}
