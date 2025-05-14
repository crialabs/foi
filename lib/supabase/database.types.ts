export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      quiz_submissions: {
        Row: {
          id: string
          name: string
          email: string
          whatsapp: string
          age: string
          supplements: Json
          prize: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          whatsapp: string
          age: string
          supplements: Json
          prize?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          whatsapp?: string
          age?: string
          supplements?: Json
          prize?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      prize_configs: {
        Row: {
          id: string
          name: string
          description: string | null
          probability: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          probability: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          probability?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          submission_id: string
          message: string
          direction: string
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          message: string
          direction: string
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          message?: string
          direction?: string
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          primary_color: string
          secondary_color: string
          accent_color: string
          font_family: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          font_family?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          font_family?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      forms: {
        Row: {
          id: string
          title: string
          description: string | null
          content: Json
          published: boolean
          submit_button_text: string
          success_message: string
          redirect_url: string | null
          share_url: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content?: Json
          published?: boolean
          submit_button_text?: string
          success_message?: string
          redirect_url?: string | null
          share_url?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: Json
          published?: boolean
          submit_button_text?: string
          success_message?: string
          redirect_url?: string | null
          share_url?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      form_steps: {
        Row: {
          id: string
          form_id: string
          title: string
          description: string | null
          order_index: number
          content: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          form_id: string
          title: string
          description?: string | null
          order_index: number
          content?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          title?: string
          description?: string | null
          order_index?: number
          content?: Json
          created_at?: string
          updated_at?: string
        }
      }
      form_fields: {
        Row: {
          id: string
          step_id: string
          type: string
          label: string
          placeholder: string | null
          required: boolean
          options: Json | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          step_id: string
          type: string
          label: string
          placeholder?: string | null
          required?: boolean
          options?: Json | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          step_id?: string
          type?: string
          label?: string
          placeholder?: string | null
          required?: boolean
          options?: Json | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      form_submissions: {
        Row: {
          id: string
          form_id: string
          data: Json
          prize: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          form_id: string
          data: Json
          prize?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          data?: Json
          prize?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      form_visits: {
        Row: {
          id: string
          form_id: string
          ip: string | null
          user_agent: string | null
          visited_at: string
        }
        Insert: {
          id?: string
          form_id: string
          ip?: string | null
          user_agent?: string | null
          visited_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          ip?: string | null
          user_agent?: string | null
          visited_at?: string
        }
      }
      uploads: {
        Row: {
          id: string
          filename: string
          original_name: string
          mime_type: string
          size: number
          path: string
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          filename: string
          original_name: string
          mime_type: string
          size: number
          path: string
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          filename?: string
          original_name?: string
          mime_type?: string
          size?: number
          path?: string
          type?: string
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
      [_ in never]: never
    }
  }
}
