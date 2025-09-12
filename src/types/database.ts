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
      profiles: {
        Row: {
          id: string
          email: string
          user_type: 'prospective_founder' | 'founder' | 'vc_general' | 'vc_anonymous'
          company_name: string | null
          anonymous_company_name: string | null
          business_registration_number: string | null
          is_verified: boolean
          credits: number
          subscription_status: 'active' | 'canceled' | 'past_due' | 'incomplete' | null
          subscription_plan: string | null
          subscription_expires_at: string | null
          is_blacklisted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          user_type: 'prospective_founder' | 'founder' | 'vc_general' | 'vc_anonymous'
          company_name?: string | null
          anonymous_company_name?: string | null
          business_registration_number?: string | null
          is_verified?: boolean
          credits?: number
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'incomplete' | null
          subscription_plan?: string | null
          subscription_expires_at?: string | null
          is_blacklisted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          user_type?: 'prospective_founder' | 'founder' | 'vc_general' | 'vc_anonymous'
          company_name?: string | null
          anonymous_company_name?: string | null
          business_registration_number?: string | null
          is_verified?: boolean
          credits?: number
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'incomplete' | null
          subscription_plan?: string | null
          subscription_expires_at?: string | null
          is_blacklisted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vcs: {
        Row: {
          id: string
          name: string
          aum: number | null
          email_domain: string | null
          main_investment_stages: Array<'angel' | 'seed' | 'pre_a' | 'series_a' | 'series_b' | 'series_c' | 'series_d' | 'other'> | null
          website: string | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          aum?: number | null
          email_domain?: string | null
          main_investment_stages?: Array<'angel' | 'seed' | 'pre_a' | 'series_a' | 'series_b' | 'series_c' | 'series_d' | 'other'> | null
          website?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          aum?: number | null
          email_domain?: string | null
          main_investment_stages?: Array<'angel' | 'seed' | 'pre_a' | 'series_a' | 'series_b' | 'series_c' | 'series_d' | 'other'> | null
          website?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          author_id: string
          vc_id: string
          personnel_id: string | null
          title: string
          content: string
          investment_round: 'angel' | 'seed' | 'pre_a' | 'series_a' | 'series_b' | 'series_c' | 'series_d' | 'other'
          investment_year: number
          investment_month: number
          tag_communication: boolean | null
          tag_consistency: boolean | null
          tag_understanding: boolean | null
          tag_leadership: boolean | null
          tag_philosophy: boolean | null
          tag_support: boolean | null
          tag_empathy: boolean | null
          tag_portfolio_interest: boolean | null
          tag_openness: boolean | null
          tag_optimism: boolean | null
          tag_honesty: boolean | null
          tag_politeness: boolean | null
          tag_intelligence: boolean | null
          status: 'published' | 'screened' | 'deleted'
          view_count: number
          like_count: number
          dislike_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          vc_id: string
          personnel_id?: string | null
          title: string
          content: string
          investment_round: 'angel' | 'seed' | 'pre_a' | 'series_a' | 'series_b' | 'series_c' | 'series_d' | 'other'
          investment_year: number
          investment_month: number
          tag_communication?: boolean | null
          tag_consistency?: boolean | null
          tag_understanding?: boolean | null
          tag_leadership?: boolean | null
          tag_philosophy?: boolean | null
          tag_support?: boolean | null
          tag_empathy?: boolean | null
          tag_portfolio_interest?: boolean | null
          tag_openness?: boolean | null
          tag_optimism?: boolean | null
          tag_honesty?: boolean | null
          tag_politeness?: boolean | null
          tag_intelligence?: boolean | null
          status?: 'published' | 'screened' | 'deleted'
          view_count?: number
          like_count?: number
          dislike_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          vc_id?: string
          personnel_id?: string | null
          title?: string
          content?: string
          investment_round?: 'angel' | 'seed' | 'pre_a' | 'series_a' | 'series_b' | 'series_c' | 'series_d' | 'other'
          investment_year?: number
          investment_month?: number
          tag_communication?: boolean | null
          tag_consistency?: boolean | null
          tag_understanding?: boolean | null
          tag_leadership?: boolean | null
          tag_philosophy?: boolean | null
          tag_support?: boolean | null
          tag_empathy?: boolean | null
          tag_portfolio_interest?: boolean | null
          tag_openness?: boolean | null
          tag_optimism?: boolean | null
          tag_honesty?: boolean | null
          tag_politeness?: boolean | null
          tag_intelligence?: boolean | null
          status?: 'published' | 'screened' | 'deleted'
          view_count?: number
          like_count?: number
          dislike_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      vc_personnel: {
        Row: {
          id: string
          vc_id: string
          name: string
          position: string
          start_date: string | null
          end_date: string | null
          current_company: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vc_id: string
          name: string
          position: string
          start_date?: string | null
          end_date?: string | null
          current_company?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vc_id?: string
          name?: string
          position?: string
          start_date?: string | null
          end_date?: string | null
          current_company?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vc_responses: {
        Row: {
          id: string
          review_id: string
          author_id: string
          content: string
          is_official: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          review_id: string
          author_id: string
          content: string
          is_official?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          author_id?: string
          content?: string
          is_official?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          review_id: string
          parent_id: string | null
          author_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          review_id: string
          parent_id?: string | null
          author_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          parent_id?: string | null
          author_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      review_reactions: {
        Row: {
          id: string
          review_id: string
          user_id: string
          is_like: boolean
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          is_like: boolean
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          is_like?: boolean
          created_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          review_id: string | null
          amount: number
          transaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          review_id?: string | null
          amount: number
          transaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          review_id?: string | null
          amount?: number
          transaction_type?: string
          created_at?: string
        }
      }
      review_views: {
        Row: {
          id: string
          user_id: string
          review_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          review_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          review_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: 'prospective_founder' | 'founder' | 'vc_general' | 'vc_anonymous'
      investment_round: 'angel' | 'seed' | 'pre_a' | 'series_a' | 'series_b' | 'series_c' | 'series_d' | 'other'
      subscription_status: 'active' | 'canceled' | 'past_due' | 'incomplete'
      review_status: 'published' | 'screened' | 'deleted'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}