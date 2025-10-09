import { bootstrapOwnerIfNeeded } from '@/scripts/bootstrap-owner';

export async function ensureBootstrap() {
  const env = process.env.OWNER_EMAIL?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
  try { 
    await bootstrapOwnerIfNeeded(env); 
  } catch (error) { 
    console.error('[Bootstrap] Error:', error);
    // swallow to avoid breaking 
  }
}
