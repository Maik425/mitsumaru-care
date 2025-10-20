// エクスポート機能用リポジトリ

// ExportDataSourceインターフェースを直接定義
interface ExportDataSource {
  // エクスポート履歴管理
  getExportHistory(
    userId?: string,
    limit?: number,
    offset?: number
  ): Promise<ExportHistory[]>;
  getExportHistoryById(id: string): Promise<ExportHistory | null>;
  createExportHistory(
    history: Omit<ExportHistory, 'id' | 'created_at'>
  ): Promise<ExportHistory>;
  updateExportHistory(
    id: string,
    updates: Partial<ExportHistory>
  ): Promise<ExportHistory>;
  deleteExportHistory(id: string): Promise<void>;

  // エクスポート設定管理
  getExportSettings(userId: string): Promise<ExportSettings | null>;
  createExportSettings(
    settings: Omit<ExportSettings, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ExportSettings>;
  updateExportSettings(
    userId: string,
    updates: Partial<ExportSettings>
  ): Promise<ExportSettings>;
  deleteExportSettings(userId: string): Promise<void>;

  // エクスポートテンプレート管理
  getExportTemplates(userId?: string): Promise<ExportTemplate[]>;
  getExportTemplateById(id: string): Promise<ExportTemplate | null>;
  createExportTemplate(
    template: Omit<ExportTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ExportTemplate>;
  updateExportTemplate(
    id: string,
    updates: Partial<ExportTemplate>
  ): Promise<ExportTemplate>;
  deleteExportTemplate(id: string): Promise<void>;

  // データ取得
  getAttendanceData(conditions?: any): Promise<AttendanceExportData[]>;
  getUserData(conditions?: any): Promise<UserExportData[]>;
  getFacilityData(conditions?: any): Promise<FacilityExportData[]>;
  getExportDataByType(type: string, conditions?: any): Promise<any[]>;
}
import {
  AttendanceExportData,
  ExportHistory,
  ExportRequest,
  ExportSettings,
  ExportTemplate,
  FacilityExportData,
  UserExportData,
} from '@/lib/dto/export';

export class ExportRepository {
  constructor(private dataSource: ExportDataSource) {}

  // エクスポート履歴管理
  async getExportHistory(
    userId?: string,
    limit = 50,
    offset = 0
  ): Promise<ExportHistory[]> {
    return this.dataSource.getExportHistory(userId, limit, offset);
  }

  async getExportHistoryById(id: string): Promise<ExportHistory | null> {
    return this.dataSource.getExportHistoryById(id);
  }

  async createExportHistory(
    history: Omit<ExportHistory, 'id' | 'created_at'>
  ): Promise<ExportHistory> {
    return this.dataSource.createExportHistory(history);
  }

  async updateExportHistory(
    id: string,
    updates: Partial<ExportHistory>
  ): Promise<ExportHistory> {
    return this.dataSource.updateExportHistory(id, updates);
  }

  async deleteExportHistory(id: string): Promise<void> {
    return this.dataSource.deleteExportHistory(id);
  }

  // エクスポート設定管理
  async getExportSettings(userId: string): Promise<ExportSettings | null> {
    return this.dataSource.getExportSettings(userId);
  }

  async createExportSettings(
    settings: Omit<ExportSettings, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ExportSettings> {
    return this.dataSource.createExportSettings(settings);
  }

  async updateExportSettings(
    id: string,
    updates: Partial<ExportSettings>
  ): Promise<ExportSettings> {
    return this.dataSource.updateExportSettings(id, updates);
  }

  async deleteExportSettings(id: string): Promise<void> {
    return this.dataSource.deleteExportSettings(id);
  }

  // エクスポートテンプレート管理
  async getExportTemplates(templateType?: string): Promise<ExportTemplate[]> {
    return this.dataSource.getExportTemplates(templateType);
  }

  async getExportTemplateById(id: string): Promise<ExportTemplate | null> {
    return this.dataSource.getExportTemplateById(id);
  }

  async createExportTemplate(
    template: Omit<ExportTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ExportTemplate> {
    return this.dataSource.createExportTemplate(template);
  }

  async updateExportTemplate(
    id: string,
    updates: Partial<ExportTemplate>
  ): Promise<ExportTemplate> {
    return this.dataSource.updateExportTemplate(id, updates);
  }

  async deleteExportTemplate(id: string): Promise<void> {
    return this.dataSource.deleteExportTemplate(id);
  }

  // データ取得
  async getAttendanceData(
    conditions: ExportRequest['export_conditions']
  ): Promise<AttendanceExportData[]> {
    return this.dataSource.getAttendanceData(conditions);
  }

  async getUserData(
    conditions: ExportRequest['export_conditions']
  ): Promise<UserExportData[]> {
    return this.dataSource.getUserData(conditions);
  }

  async getFacilityData(
    conditions: ExportRequest['export_conditions']
  ): Promise<FacilityExportData[]> {
    return this.dataSource.getFacilityData(conditions);
  }

  // ビジネスロジック
  async getExportDataByType(
    exportType: ExportRequest['export_type'],
    conditions: ExportRequest['export_conditions']
  ): Promise<AttendanceExportData[] | UserExportData[] | FacilityExportData[]> {
    switch (exportType) {
      case 'attendance':
        return this.getAttendanceData(conditions);
      case 'users':
        return this.getUserData(conditions);
      case 'facilities':
        return this.getFacilityData(conditions);
      default:
        throw new Error(`Unsupported export type: ${exportType}`);
    }
  }

  async validateExportRequest(request: ExportRequest): Promise<void> {
    if (!request.export_type) {
      throw new Error('Export type is required');
    }

    if (!request.file_format) {
      throw new Error('File format is required');
    }

    if (request.export_type === 'attendance') {
      if (
        !request.export_conditions.start_date ||
        !request.export_conditions.end_date
      ) {
        throw new Error(
          'Start date and end date are required for attendance export'
        );
      }
    }
  }
}
