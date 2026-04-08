export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      credit_transactions: {
        Row: {
          amount: number;
          balance_after: number;
          created_at: string;
          description: string | null;
          id: string;
          reference_id: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          balance_after: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          reference_id?: string | null;
          type: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["credit_transactions"]["Insert"]>;
        Relationships: [];
      };
      generated_clips: {
        Row: {
          clip_index: number;
          created_at: string;
          end_time_display: string;
          end_time_seconds: number;
          hook_text: string;
          id: string;
          job_id: string;
          reasoning: string | null;
          start_time_display: string;
          start_time_seconds: number;
          suggested_caption: string | null;
          virality_score: number | null;
        };
        Insert: {
          clip_index: number;
          created_at?: string;
          end_time_display: string;
          end_time_seconds: number;
          hook_text: string;
          id?: string;
          job_id: string;
          reasoning?: string | null;
          start_time_display: string;
          start_time_seconds: number;
          suggested_caption?: string | null;
          virality_score?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["generated_clips"]["Insert"]>;
        Relationships: [];
      };
      payment_orders: {
        Row: {
          amount_idr: number;
          created_at: string;
          credits_to_add: number;
          id: string;
          midtrans_order_id: string;
          midtrans_transaction_id: string | null;
          package_name: string;
          paid_at: string | null;
          payment_type: string | null;
          raw_notification: Json | null;
          status: string;
          updated_at: string;
          user_id: string;
          webhook_received_at: string | null;
        };
        Insert: {
          amount_idr: number;
          created_at?: string;
          credits_to_add: number;
          id?: string;
          midtrans_order_id: string;
          midtrans_transaction_id?: string | null;
          package_name: string;
          paid_at?: string | null;
          payment_type?: string | null;
          raw_notification?: Json | null;
          status?: string;
          updated_at?: string;
          user_id: string;
          webhook_received_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["payment_orders"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          credits_balance: number;
          display_name: string | null;
          email: string;
          id: string;
          max_concurrent_jobs: number;
          tier: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          credits_balance?: number;
          display_name?: string | null;
          email: string;
          id: string;
          max_concurrent_jobs?: number;
          tier?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      transcript_cache: {
        Row: {
          expires_at: string;
          fetched_at: string;
          token_count_estimate: number | null;
          transcript_language: string | null;
          transcript_text: string;
          youtube_video_id: string;
        };
        Insert: {
          expires_at?: string;
          fetched_at?: string;
          token_count_estimate?: number | null;
          transcript_language?: string | null;
          transcript_text: string;
          youtube_video_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["transcript_cache"]["Insert"]>;
        Relationships: [];
      };
      video_jobs: {
        Row: {
          ai_model: string | null;
          ai_provider: string | null;
          created_at: string;
          credits_charged: number;
          custom_prompt: string | null;
          error_code: string | null;
          error_message: string | null;
          id: string;
          input_tokens: number | null;
          output_tokens: number | null;
          processing_completed_at: string | null;
          processing_started_at: string | null;
          status: string;
          updated_at: string;
          user_id: string;
          video_duration_seconds: number | null;
          video_title: string | null;
          youtube_url: string;
          youtube_video_id: string;
        };
        Insert: {
          ai_model?: string | null;
          ai_provider?: string | null;
          created_at?: string;
          credits_charged?: number;
          custom_prompt?: string | null;
          error_code?: string | null;
          error_message?: string | null;
          id?: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          processing_completed_at?: string | null;
          processing_started_at?: string | null;
          status?: string;
          updated_at?: string;
          user_id: string;
          video_duration_seconds?: number | null;
          video_title?: string | null;
          youtube_url: string;
          youtube_video_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["video_jobs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      deduct_credits: {
        Args: {
          p_amount: number;
          p_description: string;
          p_reference_id: string;
          p_user_id: string;
        };
        Returns: { new_balance: number; success: boolean }[];
      };
      refund_credits: {
        Args: {
          p_amount: number;
          p_description: string;
          p_reference_id: string;
          p_user_id: string;
        };
        Returns: number;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
