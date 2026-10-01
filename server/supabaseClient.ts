import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserPreferences } from '../src/types';

/**
 * Server-side Supabase PostgreSQL Persistence Client (SIH 26076)
 *
 * Persists application user data (preferences, selected interests, saved locations)
 * into Supabase PostgreSQL when SUPABASE_URL & SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are provided.
 *
 * Fallback: Gracefully falls back to in-memory store if database credentials are not present
 * or if network operations fail.
 */

let supabase: SupabaseClient | null = null;
let initAttempted = false;

function getSupabaseClient(): SupabaseClient | null {
  if (initAttempted) return supabase;
  initAttempted = true;

  const url = (process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '').trim();

  if (url && key && (url.startsWith('http://') || url.startsWith('https://'))) {
    try {
      supabase = createClient(url, key, {
        auth: {
          persistSession: false,
        },
      });
      console.log('✅ Supabase PostgreSQL Client initialized.');
      return supabase;
    } catch (err: any) {
      console.warn('⚠️ Supabase client initialization failed:', err?.message || err);
      supabase = null;
    }
  }

  return null;
}

export async function saveUserPreferencesDb(userId: string, prefs: UserPreferences): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('user_preferences')
      .upsert(
        {
          user_id: userId,
          name: prefs.name,
          preferences: prefs.preferences,
          preferred_location: prefs.preferredLocation,
          saved_locations: prefs.savedLocations,
          alert_priority: prefs.alertPriority,
          has_completed_onboarding: prefs.hasCompletedOnboarding,
          language: prefs.language,
          theme: prefs.theme,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.warn(`⚠️ Supabase save preferences error for user ${userId}:`, error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn(`⚠️ Supabase exception during save preferences:`, err?.message || err);
    return false;
  }
}

export async function getUserPreferencesDb(userId: string): Promise<UserPreferences | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      userId: data.user_id,
      name: data.name || 'Mausam Explorer',
      preferences: data.preferences || [],
      preferredLocation: data.preferred_location || 'delhi',
      savedLocations: data.saved_locations || ['delhi', 'mumbai'],
      alertPriority: data.alert_priority || 'all',
      hasCompletedOnboarding: Boolean(data.has_completed_onboarding),
      language: data.language || 'en',
      theme: data.theme || 'light',
    };
  } catch {
    return null;
  }
}
