// エクスポート機能用のDTO定義

export interface ExportHistory {
  id: string;
  user_id: string;
  export_type: 'attendance' | 'users' | 'facilities' | 'custom';
  file_format: 'csv' | 'excel';
  file_name: string;
  file_path: string;
  file_size: number;
  export_conditions: Record<string, any>;
  status: 'processing' | 'completed' | 'failed';
  error_message?: string;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface ExportSettings {
  id: string;
  user_id: string;
  setting_name: string;
  export_type: 'attendance' | 'users' | 'facilities' | 'custom';
  file_format: 'csv' | 'excel';
  export_conditions: Record<string, any>;
  selected_fields: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExportTemplate {
  id: string;
  template_name: string;
  template_type: 'attendance' | 'users' | 'facilities' | 'custom';
  file_format: 'csv' | 'excel';
  template_config: Record<string, any>;
  is_system_template: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExportRequest {
  export_type: 'attendance' | 'users' | 'facilities' | 'custom';
  file_format: 'csv' | 'excel';
  export_conditions: {
    start_date?: string;
    end_date?: string;
    facility_id?: string;
    user_id?: string;
    status?: string;
  };
  selected_fields?: string[];
  template_id?: string;
}

export interface ExportProgress {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress_percentage: number;
  current_step: string;
  total_steps: number;
  estimated_remaining_time?: number;
  error_message?: string;
}

export interface AttendanceExportData {
  user_name: string;
  facility_name: string;
  date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  actual_start_time: string;
  actual_end_time: string;
  break_duration: number;
  overtime_duration: number;
  status: string;
  notes?: string;
}

export interface UserExportData {
  name: string;
  email: string;
  role: string;
  facility_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FacilityExportData {
  name: string;
  address: string;
  phone: string;
  email: string;
  user_count: number;
  created_at: string;
  updated_at: string;
}
