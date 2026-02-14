import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a lazy-initialized Supabase client
let _supabase: any = null

export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (!_supabase) {
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables')
      }
      _supabase = createClient(supabaseUrl, supabaseKey)
    }
    return _supabase[prop]
  }
})

// Server-side client with service role key for admin operations
let _supabaseAdmin: any = null

export const supabaseAdmin = new Proxy({} as any, {
  get(target, prop) {
    if (!_supabaseAdmin) {
      if (!supabaseUrl || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing Supabase admin environment variables')
      }
      _supabaseAdmin = createClient(
        supabaseUrl,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
    }
    return _supabaseAdmin[prop]
  }
})