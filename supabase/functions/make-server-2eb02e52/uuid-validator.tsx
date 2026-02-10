/**
 * Validation d'UUID
 * Évite l'erreur "@supabase/auth-js: Expected parameter to be UUID but is not"
 */

export function isValidUUID(id: string | null | undefined): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  // Pattern UUID v4
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function validateUUIDOrThrow(id: string | null | undefined, context: string): string {
  if (!isValidUUID(id)) {
    throw new Error(`${context}: ID invalide (pas un UUID): ${id}`);
  }
  return id as string;
}

export function safeGetUserById(supabase: any, userId: string | null | undefined) {
  if (!isValidUUID(userId)) {
    console.error(`❌ UUID invalide pour getUserById: ${userId}`);
    return Promise.resolve({ data: null, error: { message: 'ID invalide - pas un UUID' } });
  }
  
  return supabase.auth.admin.getUserById(userId);
}
