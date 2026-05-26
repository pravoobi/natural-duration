import type { LocaleDefinition } from "../types.js";
import { en } from "./en.js";

const registry = new Map<string, LocaleDefinition>([["en", en]]);

export function getLocale(tag: string): LocaleDefinition {
  const lang = tag.split("-")[0]!.toLowerCase();
  const locale = registry.get(tag) ?? registry.get(lang);
  if (!locale) {
    throw new Error(
      `Locale "${tag}" not found. Available: ${[...registry.keys()].join(", ")}`
    );
  }
  return locale;
}

export function registerLocale(tag: string, def: LocaleDefinition): void {
  registry.set(tag.toLowerCase(), def);
}

export { en };
