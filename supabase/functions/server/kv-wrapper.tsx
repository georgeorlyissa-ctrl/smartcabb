/**
 * Wrapper pour kv_store avec gestion améliorée des erreurs
 * Détecte les erreurs de service indisponible (Cloudflare, etc.)
 */

import * as kv from "./kv_store.tsx";

// Vérifier si une erreur est due à un service indisponible
function isServiceUnavailableError(error: any): boolean {
  if (!error) return false;
  
  const message = error.message || error.toString();
  return message.includes('<!DOCTYPE html>') ||
         message.includes('Cloudflare') ||
         message.includes('Temporarily unavailable') ||
         message.includes('Error 1105');
}

// Wrapper pour get avec gestion des erreurs
export async function get(key: string): Promise<any> {
  try {
    return await kv.get(key);
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      console.warn(`⚠️ Service temporairement indisponible pour la clé: ${key}`);
      return null;
    }
    throw error;
  }
}

// Wrapper pour set avec gestion des erreurs
export async function set(key: string, value: any): Promise<void> {
  try {
    await kv.set(key, value);
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      console.warn(`⚠️ Service temporairement indisponible, impossible de sauvegarder: ${key}`);
      throw new Error('Service temporairement indisponible');
    }
    throw error;
  }
}

// Wrapper pour del avec gestion des erreurs
export async function del(key: string): Promise<void> {
  try {
    await kv.del(key);
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      console.warn(`⚠️ Service temporairement indisponible, impossible de supprimer: ${key}`);
      throw new Error('Service temporairement indisponible');
    }
    throw error;
  }
}

// Wrapper pour mget avec gestion des erreurs
export async function mget(keys: string[]): Promise<any[]> {
  try {
    return await kv.mget(keys);
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      console.warn(`⚠️ Service temporairement indisponible pour ${keys.length} clés`);
      return [];
    }
    throw error;
  }
}

// Wrapper pour mset avec gestion des erreurs
export async function mset(keys: string[], values: any[]): Promise<void> {
  try {
    await kv.mset(keys, values);
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      console.warn(`⚠️ Service temporairement indisponible, impossible de sauvegarder ${keys.length} clés`);
      throw new Error('Service temporairement indisponible');
    }
    throw error;
  }
}

// Wrapper pour mdel avec gestion des erreurs
export async function mdel(keys: string[]): Promise<void> {
  try {
    await kv.mdel(keys);
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      console.warn(`⚠️ Service temporairement indisponible, impossible de supprimer ${keys.length} clés`);
      throw new Error('Service temporairement indisponible');
    }
    throw error;
  }
}

// Wrapper pour getByPrefix avec gestion des erreurs
export async function getByPrefix(prefix: string): Promise<any[]> {
  try {
    return await kv.getByPrefix(prefix);
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      console.warn(`⚠️ Service temporairement indisponible pour le préfixe: ${prefix}`);
      return [];
    }
    throw error;
  }
}
