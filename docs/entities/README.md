# 基本エンティティ設計書

## 📋 1. 概要

このドキュメントでは、みつまるケアシステムの基本エンティティ（データモデル）の設計について説明します。

### 1.1 設計方針

- **ドメイン駆動設計（DDD）**の原則に従う
- **業務の自然な流れ**を反映したエンティティ設計
- **拡張性**を考慮した柔軟な構造
- **パフォーマンス**を考慮した適切な正規化

### 1.2 エンティティの分類

1. **認証・認可系**: ユーザー、テナント、権限
2. **マスターデータ系**: シフト形態、役職、技能、ルール
3. **業務データ系**: シフト、役割表、勤怠
4. **設定系**: 各種テンプレート、ルール

## 🔐 2. 認証・認可系エンティティ

### 2.1 User（ユーザー）

```typescript
interface User {
  id: string; // ユーザーID（CUID）
  email: string; // メールアドレス
  name: string; // 氏名
  employeeNumber: string; // 社員番号
  phoneNumber?: string; // 電話番号
  isActive: boolean; // アクティブ状態
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
}
```

### 2.2 Tenant（テナント）

```typescript
interface Tenant {
  id: string; // テナントID（CUID）
  name: string; // 施設名
  address?: string; // 住所
  phoneNumber?: string; // 電話番号
  isActive: boolean; // アクティブ状態
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
}
```

### 2.3 UserTenantRole（ユーザーテナント権限）

```typescript
interface UserTenantRole {
  id: string; // ID（CUID）
  userId: string; // ユーザーID
  tenantId: string; // テナントID
  role: UserRole; // 権限（OWNER/ADMIN/MEMBER）
  isActive: boolean; // アクティブ状態
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
}

enum UserRole {
  OWNER = 'OWNER', // オーナー
  ADMIN = 'ADMIN', // 管理者
  MEMBER = 'MEMBER', // 一般職
}
```

## 🏢 3. マスターデータ系エンティティ

### 3.1 ShiftType（シフト形態）

```typescript
interface ShiftType {
  id: string; // ID（CUID）
  tenantId: string; // テナントID
  name: string; // シフト名（早番、日勤、遅番等）
  startTime: string; // 開始時刻（HH:mm）
  endTime: string; // 終了時刻（HH:mm）
  breakTime: number; // 休憩時間（分）
  color: string; // 表示色（HEX）
  isActive: boolean; // アクティブ状態
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
}
```

### 3.2 Position（役職）

```typescript
interface Position {
  id: string; // ID（CUID）
  tenantId: string; // テナントID
  name: string; // 役職名（介護福祉士、看護師等）
  description?: string; // 説明
  requiredSkills: string[]; // 必要な技能ID配列
  isActive: boolean; // アクティブ状態
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
}
```

### 3.3 Skill（技能）

```typescript
interface Skill {
  id: string; // ID（CUID）
  tenantId: string; // テナントID
  name: string; // 技能名（食事介助、排泄介助等）
  category: SkillCategory; // 技能カテゴリ
  description?: string; // 説明
  isActive: boolean; // アクティブ状態
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
}

enum SkillCategory {
  CARE = 'CARE', // 介護
  MEDICAL = 'MEDICAL', // 医療
  ADMINISTRATIVE = 'ADMINISTRATIVE', // 事務
  OTHER = 'OTHER', // その他
}
```

### 3.4 JobRule（職種・配置ルール）

```typescript
interface JobRule {
  id: string; // ID（CUID）
  tenantId: string; // テナントID
  name: string; // ルール名
  shiftTypeId: string; // 対象シフト形態ID
  requiredPositions: JobRulePosition[]; // 必要な役職・人数
  isActive: boolean; // アクティブ状態
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
}

interface JobRulePosition {
  positionId: string; // 役職ID
  requiredCount: number; // 必要人数
  priority: number; // 優先度（1-5）
}
```

### 3.5 RoleTemplate（役割表テンプレート）

```typescript
interface RoleTemplate {
  id: string; // ID（CUID）
  tenantId: string; // テナントID
  name: string; // テンプレート名
  shiftTypeId: string; // 対象シフト形態ID
  roles: RoleTemplateRole[]; // 役割配列
  isActive: boolean; // アクティブ状態
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
}

interface RoleTemplateRole {
  name: string; // 役割名
  startTime: string; // 開始時刻
  endTime: string; // 終了時刻
  requiredCount: number; // 必要人数
  requiredSkills: string[]; // 必要な技能ID配列
  description?: string; // 説明
}
```

## 📅 4. 業務データ系エンティティ

### 4.1 Shift（シフト）

```typescript
interface Shift {
  id: string; // ID（CUID）
  tenantId: string; // テナントID
  date: string; // 日付（YYYY-MM-DD）
  shiftTypeId: string; // シフト形態ID
  assignedUsers: ShiftAssignment[]; // 割り当てユーザー
  status: ShiftStatus; // ステータス
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
}

interface ShiftAssignment {
  userId: string; // ユーザーID
  positionId: string; // 役職ID
  isSubstitute: boolean; // 代行フラグ
}

enum ShiftStatus {
  DRAFT = 'DRAFT', // 下書き
  PUBLISHED = 'PUBLISHED', // 公開済み
  COMPLETED = 'COMPLETED', // 完了
}
```

### 4.2 RoleAssignment（役割割り当て）

```typescript
interface RoleAssignment {
  id: string; // ID（CUID）
  tenantId: string; // テナントID
  shiftId: string; // シフトID
  date: string; // 日付（YYYY-MM-DD）
  assignments: RoleAssignmentDetail[]; // 役割割り当て詳細
  status: RoleAssignmentStatus; // ステータス
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
}

interface RoleAssignmentDetail {
  userId: string; // ユーザーID
  roleName: string; // 役割名
  startTime: string; // 開始時刻
  endTime: string; // 終了時刻
  notes?: string; // 備考
}

enum RoleAssignmentStatus {
  DRAFT = 'DRAFT', // 下書き
  PUBLISHED = 'PUBLISHED', // 公開済み
  COMPLETED = 'COMPLETED', // 完了
}
```

### 4.3 Attendance（勤怠）

```typescript
interface Attendance {
  id: string; // ID（CUID）
  tenantId: string; // テナントID
  userId: string; // ユーザーID
  shiftId: string; // シフトID
  date: string; // 日付（YYYY-MM-DD）
  plannedStartTime: string; // 予定開始時刻
  plannedEndTime: string; // 予定終了時刻
  actualStartTime?: string; // 実際開始時刻
  actualEndTime?: string; // 実際終了時刻
  status: AttendanceStatus; // ステータス
  notes?: string; // 備考
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
}

enum AttendanceStatus {
  PLANNED = 'PLANNED', // 予定
  CHECKED_IN = 'CHECKED_IN', // 出勤済み
  CHECKED_OUT = 'CHECKED_OUT', // 退勤済み
  ABSENT = 'ABSENT', // 欠勤
  LATE = 'LATE', // 遅刻
  EARLY_LEAVE = 'EARLY_LEAVE', // 早退
  OVERTIME = 'OVERTIME', // 残業
}
```

### 4.4 Holiday（休暇）

```typescript
interface Holiday {
  id: string; // ID（CUID）
  tenantId: string; // テナントID
  userId: string; // ユーザーID
  date: string; // 日付（YYYY-MM-DD）
  type: HolidayType; // 休暇種別
  status: HolidayStatus; // ステータス
  reason?: string; // 理由
  approvedBy?: string; // 承認者ID
  approvedAt?: Date; // 承認日時
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
}

enum HolidayType {
  PAID_LEAVE = 'PAID_LEAVE', // 有給休暇
  SICK_LEAVE = 'SICK_LEAVE', // 病気休暇
  PERSONAL_LEAVE = 'PERSONAL_LEAVE', // 私用休暇
  EXCHANGE_LEAVE = 'EXCHANGE_LEAVE', // 振替休暇
}

enum HolidayStatus {
  REQUESTED = 'REQUESTED', // 申請中
  APPROVED = 'APPROVED', // 承認済み
  REJECTED = 'REJECTED', // 却下
  CANCELLED = 'CANCELLED', // キャンセル
}
```

## 🔧 5. 設定系エンティティ

### 5.1 AttendanceRule（勤怠ルール）

```typescript
interface AttendanceRule {
  id: string; // ID（CUID）
  tenantId: string; // テナントID
  name: string; // ルール名
  lateThreshold: number; // 遅刻判定閾値（分）
  earlyLeaveThreshold: number; // 早退判定閾値（分）
  overtimeThreshold: number; // 残業判定閾値（分）
  breakTimeRules: BreakTimeRule[]; // 休憩時間ルール
  isActive: boolean; // アクティブ状態
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
}

interface BreakTimeRule {
  workHours: number; // 労働時間（時間）
  breakTime: number; // 休憩時間（分）
}
```

## 🔗 6. エンティティ間の関係

### 6.1 主要な関係性

```
Tenant (1) ←→ (N) UserTenantRole (N) ←→ (1) User
Tenant (1) ←→ (N) ShiftType
Tenant (1) ←→ (N) Position
Tenant (1) ←→ (N) Skill
Tenant (1) ←→ (N) JobRule
Tenant (1) ←→ (N) RoleTemplate
Tenant (1) ←→ (N) Shift
Tenant (1) ←→ (N) RoleAssignment
Tenant (1) ←→ (N) Attendance
Tenant (1) ←→ (N) Holiday
Tenant (1) ←→ (N) AttendanceRule

ShiftType (1) ←→ (N) Shift
ShiftType (1) ←→ (N) JobRule
ShiftType (1) ←→ (N) RoleTemplate

Position (1) ←→ (N) JobRulePosition
Skill (1) ←→ (N) JobRulePosition
Skill (1) ←→ (N) RoleTemplateRole

Shift (1) ←→ (N) Attendance
Shift (1) ←→ (1) RoleAssignment
```

### 6.2 データの整合性

- **外部キー制約**: 適切な参照整合性の確保
- **カスケード削除**: 親エンティティ削除時の子エンティティ処理
- **ユニーク制約**: 重複データの防止
- **チェック制約**: データの妥当性検証

## 📊 7. パフォーマンス考慮事項

### 7.1 インデックス設計

- **主キー**: 全テーブルのID
- **外部キー**: 関連テーブル間の結合
- **検索条件**: 日付、ユーザーID、テナントID
- **複合インデックス**: 頻繁に使用される組み合わせ

### 7.2 データ分割戦略

- **テナント別分割**: マルチテナント対応
- **日付別分割**: 時系列データの効率化
- **アーカイブ**: 古いデータの適切な管理

---

**次段階**: [システム構成設計](./../architecture/README.md) に進む
