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
      users: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
          role?: string
          avatar_url?: string
          bio?: string
          company?: string
          password_hash?: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string
          role?: string
          avatar_url?: string
          bio?: string
          company?: string
          password_hash?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
          role?: string
          avatar_url?: string
          bio?: string
          company?: string
          password_hash?: string
        }
      },
      vacancies: {
        Row: {
          id: string
          title: string
          description: string
          company: string
          location: string
          salary_range?: string
          job_type: string
          created_at: string
          expires_at?: string
          recruiter_id: string
          status: string
          requirements?: string[]
          benefits?: string[]
          featured?: boolean
        }
        Insert: {
          id?: string
          title: string
          description: string
          company: string
          location: string
          salary_range?: string
          job_type: string
          created_at?: string
          expires_at?: string
          recruiter_id: string
          status: string
          requirements?: string[]
          benefits?: string[]
          featured?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string
          company?: string
          location?: string
          salary_range?: string
          job_type?: string
          created_at?: string
          expires_at?: string
          recruiter_id?: string
          status?: string
          requirements?: string[]
          benefits?: string[]
          featured?: boolean
        }
      },
      applications: {
        Row: {
          id: string
          job_posting_id: string
          applicant_id: string
          status: string
          created_at: string
          updated_at: string
          resume_url?: string
          cover_letter?: string
          notes?: string
          test_score?: number
          interview_date?: string
        }
        Insert: {
          id?: string
          job_posting_id: string
          applicant_id: string
          status: string
          created_at?: string
          updated_at?: string
          resume_url?: string
          cover_letter?: string
          notes?: string
          test_score?: number
          interview_date?: string
        }
        Update: {
          id?: string
          job_posting_id?: string
          applicant_id?: string
          status?: string
          created_at?: string
          updated_at?: string
          resume_url?: string
          cover_letter?: string
          notes?: string
          test_score?: number
          interview_date?: string
        }
      }
    }
  }
}
