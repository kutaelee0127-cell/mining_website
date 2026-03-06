export type LocalizedCopy = Record<string, string>;

export interface Translator {
  (key: string): string;
}
