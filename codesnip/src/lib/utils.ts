import { nanoid } from "nanoid";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function createSnippetSlug() {
  return nanoid(10);
}
