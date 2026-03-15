export type Outcome = 'win' | 'loss' | 'breakeven'
export type Session = 'london' | 'new_york' | 'asian' | 'overlap'
export type Emotion = 'calm' | 'anxious' | 'confident' | 'frustrated' | 'fomo' | 'revenge'

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
  outcome: Outcome
  followed_plan: boolean
  emotion: Emotion
  screenshot_url: string | null
  created_at: string
}

export type NewTrade = Omit<Trade, 'id' | 'created_at'>