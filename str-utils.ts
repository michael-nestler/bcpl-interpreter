export function substringBefore(haystack: string, needle: string): string {
  const index = haystack.indexOf(needle);
  if (index === -1) return haystack;
  return haystack.substring(0, index);
}

export function removePrefix(string: string, prefix: string) {
  if (string.startsWith(prefix)) {
    return string.substring(prefix.length);
  }
  return string;
}
