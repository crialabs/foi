// Este arquivo é mantido para compatibilidade com código legado
// Todas as novas implementações devem usar diretamente o cliente Supabase

import { createServerSupabaseClient } from "./supabase/server"

// Simplified database interface that redirects to Supabase
export const db = {
  async query(sql: string, params: any[] = []) {
    console.warn("db.query is deprecated. Use Supabase client directly.")
    const supabase = createServerSupabaseClient()
    const { data } = await supabase.rpc("execute_sql", { query: sql, params })
    return data || []
  },

  async get(sql: string, params: any[] = []) {
    console.warn("db.get is deprecated. Use Supabase client directly.")
    const supabase = createServerSupabaseClient()
    const { data } = await supabase.rpc("execute_sql", { query: sql, params })
    return data?.[0] || null
  },

  async run(sql: string, params: any[] = []) {
    console.warn("db.run is deprecated. Use Supabase client directly.")
    const supabase = createServerSupabaseClient()
    return await supabase.rpc("execute_sql", { query: sql, params })
  },

  async exec(sql: string) {
    console.warn("db.exec is deprecated. Use Supabase client directly.")
    const supabase = createServerSupabaseClient()
    return await supabase.rpc("execute_sql", { query: sql })
  },

  async close() {
    // No-op for Supabase
  },
}

// These functions are no longer needed but kept for compatibility
export async function initializeDatabase() {
  console.warn("initializeDatabase is deprecated. Database is managed by Supabase.")
  return true
}

export async function getDb() {
  console.warn("getDb is deprecated. Use Supabase client directly.")
  return null
}
