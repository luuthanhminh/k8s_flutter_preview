import shortUUID from 'short-uuid';

export function generateShortId(guid: string, maxLength?: number): string {
  const translator = shortUUID();
  return translator.fromUUID(guid).slice(0, maxLength ?? guid.length);
}
