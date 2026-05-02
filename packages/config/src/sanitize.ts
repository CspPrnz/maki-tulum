/**
 * Strip HTML tags from user-supplied text. Defense-in-depth at the API boundary.
 * Lesson from Civion Safe: never store HTML in text fields; React escaping is not
 * sufficient because it doesn't apply to all rendering paths.
 */
export function sanitizeText(input: string, maxLength?: number): string {
  let result = input.replace(/<[^>]*>/g, '').trim();
  if (maxLength !== undefined) {
    result = result.slice(0, maxLength);
  }
  return result;
}
