import { createClient } from './client'
import { Trade, NewTrade } from '@/types/trade'

// ── Fetch all trades (newest first) ──────────────────────────────
export async function fetchTrades(): Promise<Trade[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchTrades error:', error.message)
    throw new Error(error.message)
  }

  return data as Trade[]
}

// ── Fetch single trade by ID ──────────────────────────────────────
export async function fetchTradeById(id: string): Promise<Trade> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('fetchTradeById error:', error.message)
    throw new Error(error.message)
  }

  return data as Trade
}

// ── Insert new trade ──────────────────────────────────────────────
export async function insertTrade(trade: NewTrade): Promise<Trade> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('trades')
    .insert({ ...trade, user_id: user.id })
    .select()
    .single()

  if (error) {
    console.error('insertTrade error:', error.message)
    throw new Error(error.message)
  }

  return data as Trade
}

// ── Update existing trade ─────────────────────────────────────────
export async function updateTrade(id: string, updates: Partial<NewTrade>): Promise<Trade> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('trades')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('updateTrade error:', error.message)
    throw new Error(error.message)
  }

  return data as Trade
}

// ── Delete trade ──────────────────────────────────────────────────
export async function deleteTrade(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('deleteTrade error:', error.message)
    throw new Error(error.message)
  }
}

// ── Upload screenshot to Supabase Storage ─────────────────────────
export async function uploadScreenshot(file: File): Promise<string> {
  const supabase = createClient()
  const compressed = await compressImage(file, 1200, 0.75)
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

  const { error } = await supabase.storage
    .from('screenshots')
    .upload(filename, compressed, { contentType: 'image/jpeg' })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage
    .from('screenshots')
    .getPublicUrl(filename)

  return data.publicUrl
}

// ── Compress image using Canvas API ───────────────────────────────
function compressImage(file: File, maxWidth: number, quality: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => resolve(blob!), 'image/jpeg', quality)
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}
// ── Account size (for the 1% risk rule), stored per platform ──────
export async function fetchAccountSize(platform: string): Promise<number | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('account_settings')
    .select('account_size')
    .eq('platform', platform)
    .maybeSingle()

  if (error) {
    console.error('fetchAccountSize error:', error.message)
    return null
  }

  return data ? Number(data.account_size) : null
}

export async function saveAccountSize(size: number, platform: string): Promise<void> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('account_settings')
    .upsert(
      { user_id: user.id, platform, account_size: size, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,platform' }
    )

  if (error) {
    console.error('saveAccountSize error:', error.message)
    throw new Error(error.message)
  }
}