//comment
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          mission_statement: string | null
          usp_statement: string | null
          brand_persona_description: string | null
          core_values: string[] | null
          target_audience: string | null
          brand_keywords_include: string[] | null
          brand_keywords_exclude: string[] | null
          created_at: string
          updated_at: string
          brand_voice: string | null
          industry: string | null
          primary_color: string | null
          secondary_color: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          mission_statement?: string | null
          usp_statement?: string | null
          brand_persona_description?: string | null
          core_values?: string[] | null
          target_audience?: string | null
          brand_keywords_include?: string[] | null
          brand_keywords_exclude?: string[] | null
          created_at?: string
          updated_at?: string
          brand_voice?: string | null
          industry?: string | null
          primary_color?: string | null
          secondary_color?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          mission_statement?: string | null
          usp_statement?: string | null
          brand_persona_description?: string | null
          core_values?: string[] | null
          target_audience?: string | null
          brand_keywords_include?: string[] | null
          brand_keywords_exclude?: string[] | null
          created_at?: string
          updated_at?: string
          brand_voice?: string | null
          industry?: string | null
          primary_color?: string | null
          secondary_color?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          user_id: string
          page_id: string | null
          campaign_name: string
          schedule_cron: string | null
          next_run_at: string | null
          is_active: boolean
          ai_extra_metadata: Json | null
          created_at: string
          updated_at: string
          account_type: string | null
          timezone: string | null
          ai_tone: string | null
          ai_content_style: string | null
          ai_posting_frequency: string | null
          status: string
          last_run_at: string | null
          social_id: string | null
          description: string | null
          previous_post: string | null
          brand_id: string | null
          goal: string | null
          target_audience_specific: Json | null
          target_audience_psychographics: string | null
          ai_tone_preference: string[] | null
          ai_content_style_preference: string[] | null
          negative_constraints_campaign: string | null
          cta_action: string | null
          cta_link: string | null
          post_length_type: string | null
          // platform_specific_notes: Json | null  // Commented out - not in schema
          ai_intent: string | null
        }
        Insert: {
          id?: string
          user_id: string
          page_id?: string | null
          campaign_name: string
          schedule_cron?: string | null
          next_run_at?: string | null
          is_active?: boolean
          ai_extra_metadata?: Json | null
          created_at?: string
          updated_at?: string
          account_type?: string | null
          timezone?: string | null
          ai_tone?: string | null
          ai_content_style?: string | null
          ai_posting_frequency?: string | null
          status?: string
          last_run_at?: string | null
          social_id?: string | null
          description?: string | null
          previous_post?: string | null
          brand_id?: string | null
          goal?: string | null
          target_audience_specific?: Json | null
          target_audience_psychographics?: string | null
          ai_tone_preference?: string[] | null
          ai_content_style_preference?: string[] | null
          negative_constraints_campaign?: string | null
          cta_action?: string | null
          cta_link?: string | null
          post_length_type?: string | null
          // platform_specific_notes?: Json | null  // Commented out - not in schema
          ai_intent?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          page_id?: string | null
          campaign_name?: string
          schedule_cron?: string | null
          next_run_at?: string | null
          is_active?: boolean
          ai_extra_metadata?: Json | null
          created_at?: string
          updated_at?: string
          account_type?: string | null
          timezone?: string | null
          ai_tone?: string | null
          ai_content_style?: string | null
          ai_posting_frequency?: string | null
          status?: string
          last_run_at?: string | null
          social_id?: string | null
          description?: string | null
          previous_post?: string | null
          brand_id?: string | null
          goal?: string | null
          target_audience_specific?: Json | null
          target_audience_psychographics?: string | null
          ai_tone_preference?: string[] | null
          ai_content_style_preference?: string[] | null
          negative_constraints_campaign?: string | null
          cta_action?: string | null
          cta_link?: string | null
          post_length_type?: string | null
          // platform_specific_notes?: Json | null  // Commented out - not in schema
          ai_intent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "social_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_social_id_fkey"
            columns: ["social_id"]
            isOneToOne: false
            referencedRelation: "social_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      oauth_states: {
        Row: {
          code_verifier: string | null
          created_at: string
          id: string
          provider: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code_verifier?: string | null
          created_at?: string
          id?: string
          provider: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code_verifier?: string | null
          created_at?: string
          id?: string
          provider?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      posts_log: {
        Row: {
          ai_prompt_used: string | null
          campaign_id: string | null
          created_at: string
          generated_content: string
          id: string
          page_id: string | null
          posted_at: string | null
        }
        Insert: {
          ai_prompt_used?: string | null
          campaign_id?: string | null
          created_at?: string
          generated_content: string
          id?: string
          page_id?: string | null
          posted_at?: string | null
        }
        Update: {
          ai_prompt_used?: string | null
          campaign_id?: string | null
          created_at?: string
          generated_content?: string
          id?: string
          page_id?: string | null
          posted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_log_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_log_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "social_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          brand_bio: string | null
          brand_name: string
          brand_tone: string | null
          business_url: string | null
          created_at: string
          email: string | null
          id: string
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          brand_bio?: string | null
          brand_name: string
          brand_tone?: string | null
          business_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          brand_bio?: string | null
          brand_name?: string
          brand_tone?: string | null
          business_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          account_id: string | null
          account_name: string | null
          created_at: string
          id: string
          long_lived_user_token: string | null
          oauth_refresh_token: string | null
          oauth_user_token: string
          provider: string
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          account_name?: string | null
          created_at?: string
          id?: string
          long_lived_user_token?: string | null
          oauth_refresh_token?: string | null
          oauth_user_token: string
          provider: string
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          account_name?: string | null
          created_at?: string
          id?: string
          long_lived_user_token?: string | null
          oauth_refresh_token?: string | null
          oauth_user_token?: string
          provider?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      social_pages: {
        Row: {
          ai_extra_notes: Json | null
          connection_id: string
          created_at: string
          id: string
          page_access_token: string
          page_category: string | null
          page_description: string | null
          page_id: string
          page_name: string
          page_picture_url: string | null
          page_token_expires_at: string | null
          preferred_audience: string | null
          provider: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_extra_notes?: Json | null
          connection_id: string
          created_at?: string
          id?: string
          page_access_token: string
          page_category?: string | null
          page_description?: string | null
          page_id: string
          page_name: string
          page_picture_url?: string | null
          page_token_expires_at?: string | null
          preferred_audience?: string | null
          provider?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_extra_notes?: Json | null
          connection_id?: string
          created_at?: string
          id?: string
          page_access_token?: string
          page_category?: string | null
          page_description?: string | null
          page_id?: string
          page_name?: string
          page_picture_url?: string | null
          page_token_expires_at?: string | null
          preferred_audience?: string | null
          provider?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_pages_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "social_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_pages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          ended_at: string | null
          id: string
          price_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          tier: string
          trial_end_at: string | null
          trial_start_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          ended_at?: string | null
          id?: string
          price_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          tier: string
          trial_end_at?: string | null
          trial_start_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          ended_at?: string | null
          id?: string
          price_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          tier?: string
          trial_end_at?: string | null
          trial_start_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      survey_questions: {
        Row: {
          created_at: string
          id: string
          question_text: string
          question_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_text: string
          question_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          question_text?: string
          question_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          created_at: string
          id: string
          question_id: string
          response_rating: number | null
          response_text: string | null
          response_yes_no: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          response_rating?: number | null
          response_text?: string | null
          response_yes_no?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          response_rating?: number | null
          response_text?: string | null
          response_yes_no?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const