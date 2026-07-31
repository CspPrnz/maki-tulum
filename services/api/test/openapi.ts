/**
 * Minimal structural JSON-Schema checker for contract tests. Not a general
 * validator — covers exactly the shapes zod-to-openapi emits for this API's
 * routes (object/string/number/boolean, enum, required, additionalProperties)
 * so handler responses are checked against the *live* /openapi.json rather
 * than a hand-copied expectation, without pulling in a new dependency.
 */
export type JsonSchema = {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  enum?: unknown[];
  additionalProperties?: JsonSchema | boolean;
};

type OpenApiOperation = {
  responses: Record<string, { content?: Record<string, { schema: JsonSchema }> }>;
};

export type OpenApiDoc = {
  paths: Record<string, Record<string, OpenApiOperation>>;
};

export function schemaFor(
  doc: OpenApiDoc,
  path: string,
  method: string,
  status: number,
): JsonSchema {
  const operation = doc.paths[path]?.[method.toLowerCase()];
  const schema = operation?.responses[String(status)]?.content?.['application/json']?.schema;
  if (!schema) {
    throw new Error(
      `No OpenAPI schema registered for ${method.toUpperCase()} ${path} -> ${status}`,
    );
  }
  return schema;
}

export function assertMatchesSchema(value: unknown, schema: JsonSchema, path = '$'): void {
  if (schema.enum) {
    if (!schema.enum.includes(value)) {
      throw new Error(
        `${path}: expected one of ${JSON.stringify(schema.enum)}, got ${JSON.stringify(value)}`,
      );
    }
    return;
  }

  switch (schema.type) {
    case 'object': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error(`${path}: expected object, got ${JSON.stringify(value)}`);
      }
      const obj = value as Record<string, unknown>;
      for (const key of schema.required ?? []) {
        if (!(key in obj)) throw new Error(`${path}: missing required property "${key}"`);
      }
      for (const [key, propSchema] of Object.entries(schema.properties ?? {})) {
        if (key in obj) assertMatchesSchema(obj[key], propSchema, `${path}.${key}`);
      }
      if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        const known = new Set(Object.keys(schema.properties ?? {}));
        for (const [key, propValue] of Object.entries(obj)) {
          if (!known.has(key)) {
            assertMatchesSchema(propValue, schema.additionalProperties, `${path}.${key}`);
          }
        }
      }
      return;
    }
    case 'string':
      if (typeof value !== 'string')
        throw new Error(`${path}: expected string, got ${JSON.stringify(value)}`);
      return;
    case 'number':
    case 'integer':
      if (typeof value !== 'number')
        throw new Error(`${path}: expected number, got ${JSON.stringify(value)}`);
      return;
    case 'boolean':
      if (typeof value !== 'boolean')
        throw new Error(`${path}: expected boolean, got ${JSON.stringify(value)}`);
      return;
    default:
      return;
  }
}
