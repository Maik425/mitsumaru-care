// Supabase型定義（簡素化版）

export interface Database {
  public: {
    Tables: {
      export_history: {
        Row: any;
        Insert: any;
        Update: any;
      };
      export_settings: {
        Row: any;
        Insert: any;
        Update: any;
      };
      export_templates: {
        Row: any;
        Insert: any;
        Update: any;
      };
      attendance_records: {
        Row: any;
        Insert: any;
        Update: any;
      };
      users: {
        Row: any;
        Insert: any;
        Update: any;
      };
      facilities: {
        Row: any;
        Insert: any;
        Update: any;
      };
    };
    Functions: {
      increment_download_count: {
        Args: any;
        Returns: any;
      };
    };
  };
}
