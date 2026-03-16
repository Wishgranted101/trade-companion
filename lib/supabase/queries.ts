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

  const { data, error } = await supabase
    .from('trades')
    .insert(trade)
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

// ── Stats helper — fetch wins/losses/be counts ────────────────────
export async function fetchTradeStats() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('trades')
    .select('outcome, rr_result, followed_plan')

  if (error) {
    console.error('fetchTradeStats error:', error.message)
    throw new Error(error.message)
  }

  const trades = data as Pick<Trade, 'outcome' | 'rr_result' | 'followed_plan'>[]
  const total = trades.length
  const wins = trades.filter(t => t.outcome === 'win').length
  const losses = trades.filter(t => t.outcome === 'loss').length
  const followedPlan = trades.filter(t => t.followed_plan).length
  const avgRR = trades
    .filter(t => t.rr_result !== null)
    .reduce((sum, t, _, arr) => sum + (t.rr_result! / arr.length), 0)

  return {
    total,
    wins,
    losses,
    winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
    followedPlanRate: total > 0 ? Math.round((followedPlan / total) * 100) : 0,
    avgRR: Math.round(avgRR * 100) / 100,
  }
}

// ── Upload screenshot to Supabase Storage ─────────────────────────
export async function uploadScreenshot(file: File): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('screenshots')
    .upload(filename, file, { contentType: file.type })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage
    .from('screenshots')
    .getPublicUrl(filename)

  return data.publicUrl
}