export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      funds: {
        Row: {
          id: string
          user_id: string
          currency: string
          amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          currency: string
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          currency?: string
          amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      portfolios: {
        Row: {
          id: string
          user_id: string
          coin_symbol: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          coin_symbol: string
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          coin_symbol?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          coin_symbol: string
          transaction_type: 'BUY' | 'SELL'
          quantity: number
          price_per_coin: number
          total_amount: number
          status: 'pending' | 'completed' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          coin_symbol: string
          transaction_type: 'BUY' | 'SELL'
          quantity: number
          price_per_coin: number
          total_amount: number
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          coin_symbol?: string
          transaction_type?: 'BUY' | 'SELL'
          quantity?: number
          price_per_coin?: number
          total_amount?: number
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      decrement_funds: {
        Args: {
          p_user_id: string
          p_amount: number
        }
        Returns: {
          success: boolean
          error?: string
          current_amount?: number
          required_amount?: number
          previous_amount?: number
          new_amount?: number
          detail?: string
        }
      }
      increment_funds: {
        Args: {
          p_user_id: string
          p_amount: number
        }
        Returns: {
          success: boolean
          error?: string
          previous_amount?: number
          new_amount?: number
          detail?: string
        }
      }
    }
  }
}
