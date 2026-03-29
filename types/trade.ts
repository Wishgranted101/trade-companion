export type Outcome = 'win' | 'loss' | 'breakeven'
export type Session = 'london' | 'new_york' | 'asian' | 'overlap'
export type Emotion = 'calm' | 'anxious' | 'confident' | 'frustrated' | 'fomo' | 'revenge'
export type TradeStatus = 'open' | 'closed'

export interface Trade {
  id: string
  pair: string
  setup_type: string
  session: Session
  entry_price: number
  stop_price: number
  target_price: number
  rr_planned: number
  rr_result: number | null
  outcome: Outcome | null
  followed_plan: boolean
  emotion: Emotion | null
  screenshot_url: string | null
  status: TradeStatus
  closing_note: string | null
  lot_size: number | null
  dollar_pnl: number | null
  created_at: string
}

export type NewTrade = Omit<Trade, 'id' | 'created_at'>
