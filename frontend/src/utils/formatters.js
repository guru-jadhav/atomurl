/**
 * Format numbers compactly with standard suffixes:
 * e.g., 0 -> "0", 845 -> "845", 15074 -> "15K+", 1500000 -> "1.5M+", 100000000 -> "100M+"
 */
export function formatCompactNumber(num) {
  if (num == null || isNaN(num)) return '0';
  const n = Number(num);
  if (n < 1000) return String(n);
  
  if (n < 1_000_000) {
    const val = (n / 1000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '');
    return `${val}K+`;
  }
  
  if (n < 1_000_000_000) {
    const val = (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, '');
    return `${val}M+`;
  }
  
  if (n < 1_000_000_000_000) {
    const val = (n / 1_000_000_000).toFixed(n >= 10_000_000_000 ? 0 : 1).replace(/\.0$/, '');
    return `${val}B+`;
  }
  
  const val = (n / 1_000_000_000_000).toFixed(n >= 10_000_000_000_000 ? 0 : 1).replace(/\.0$/, '');
  return `${val}T+`;
}
