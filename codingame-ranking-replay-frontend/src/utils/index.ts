export const pythonStyleQuote = (str: string): string => {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
  // .replace(/\./g, '%2E')
  // .replace(/-/g, '%2D')
  // .replace(/_/g, '%5F')
  // .replace(/~/g, '%7E');
}