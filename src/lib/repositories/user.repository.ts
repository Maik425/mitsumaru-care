import type {
  CreateUserDto,
  DeleteUserDto,
  GetUserDto,
  GetUsersDto,
  ResetPasswordDto,
  UpdateUserDto,
  UserRawData,
  UserResponseDto,
  UsersListResponseDto,
} from '@/lib/dto/user.dto';
import { supabaseAdmin } from '@/lib/supabase';

export class UserRepository {
  /**
   * ユーザー一覧を取得
   */
  async getUsers(dto: GetUsersDto): Promise<UsersListResponseDto> {
    try {
      const { data, error } = await (supabaseAdmin as any).rpc(
        'get_users_with_email',
        {
          limit_count: dto.limit || 10,
          offset_count: dto.offset || 0,
          role_filter: dto.role || null,
          facility_filter: dto.facility_id || null,
        }
      );

      if (error) {
        throw new Error(`ユーザー一覧の取得に失敗しました: ${error.message}`);
      }

      // 総数を取得
      const { count } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

      const users = this.mapRawDataToResponseDto(data as UserRawData[]);

      return {
        users,
        total: count || 0,
        limit: dto.limit || 10,
        offset: dto.offset || 0,
      };
    } catch (error) {
      throw new Error(`ユーザー一覧の取得中にエラーが発生しました: ${error}`);
    }
  }

  /**
   * ユーザー詳細を取得
   */
  async getUser(dto: GetUserDto): Promise<UserResponseDto> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', dto.id)
        .single();

      if (error || !data) {
        throw new Error(
          `ユーザーが見つかりません: ${error?.message || 'データが存在しません'}`
        );
      }

      // emailを取得
      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(
        dto.id
      );
      const email = authData?.user?.email || '';

      const userData: UserRawData = {
        id: (data as any).id,
        email,
        name: (data as any).name,
        role: (data as any).role,
        facility_id: (data as any).facility_id,
        is_active: (data as any).is_active,
        created_at: (data as any).created_at,
        updated_at: (data as any).updated_at,
      };

      return this.mapRawDataToResponseDto([userData])[0];
    } catch (error) {
      throw new Error(`ユーザー情報の取得中にエラーが発生しました: ${error}`);
    }
  }

  /**
   * ユーザーを作成
   */
  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    try {
      // Supabaseでユーザー作成
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: dto.email,
          password: dto.password,
          email_confirm: true,
        });

      if (authError) {
        console.error('Auth user creation error:', authError);
        throw new Error(`ユーザー作成に失敗しました: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('ユーザー作成に失敗しました');
      }

      console.log('Auth user created successfully:', authData.user.id);

      // ユーザー情報をデータベースに保存
      const insertData = {
        id: authData.user.id,
        name: dto.name,
        role: dto.role,
        facility_id: dto.facility_id,
        is_active: true,
      };

      console.log('Inserting user data:', insertData);

      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .insert(insertData as any)
        .select()
        .single();

      if (userError) {
        console.error('Database insert error:', userError);
        // 作成したユーザーを削除
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw new Error(
          `ユーザー情報の保存に失敗しました: ${userError.message}`
        );
      }

      const responseData: UserRawData = {
        id: (userData as any).id,
        email: dto.email,
        name: (userData as any).name,
        role: (userData as any).role,
        facility_id: (userData as any).facility_id,
        is_active: (userData as any).is_active,
        created_at: (userData as any).created_at,
        updated_at: (userData as any).updated_at,
      };

      return this.mapRawDataToResponseDto([responseData])[0];
    } catch (error) {
      throw new Error(`ユーザー作成中にエラーが発生しました: ${error}`);
    }
  }

  /**
   * ユーザーを更新
   */
  async updateUser(dto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      const updateData: any = {};

      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.role !== undefined) updateData.role = dto.role;
      if (dto.facility_id !== undefined)
        updateData.facility_id = dto.facility_id;
      if (dto.is_active !== undefined) updateData.is_active = dto.is_active;

      const { data, error } = await (supabaseAdmin as any)
        .from('users')
        .update(updateData)
        .eq('id', dto.id)
        .select()
        .single();

      if (error || !data) {
        throw new Error(
          `ユーザー情報の更新に失敗しました: ${error?.message || 'データが存在しません'}`
        );
      }

      // emailを取得
      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(
        dto.id
      );
      const email = authData?.user?.email || '';

      const userData: UserRawData = {
        id: (data as any).id,
        email,
        name: (data as any).name,
        role: (data as any).role,
        facility_id: (data as any).facility_id,
        is_active: (data as any).is_active,
        created_at: (data as any).created_at,
        updated_at: (data as any).updated_at,
      };

      return this.mapRawDataToResponseDto([userData])[0];
    } catch (error) {
      throw new Error(`ユーザー更新中にエラーが発生しました: ${error}`);
    }
  }

  /**
   * ユーザーを削除
   */
  async deleteUser(dto: DeleteUserDto): Promise<void> {
    try {
      // データベースからユーザー情報を削除
      const { error: userError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', dto.id);

      if (userError) {
        throw new Error(
          `ユーザー情報の削除に失敗しました: ${userError.message}`
        );
      }

      // Supabaseからユーザーを削除
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
        dto.id
      );

      if (authError) {
        throw new Error(
          `ユーザーアカウントの削除に失敗しました: ${authError.message}`
        );
      }
    } catch (error) {
      throw new Error(`ユーザー削除中にエラーが発生しました: ${error}`);
    }
  }

  /**
   * パスワードをリセット
   */
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    try {
      const { error } = await supabaseAdmin.auth.resetPasswordForEmail(
        dto.email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/reset-password`,
        }
      );

      if (error) {
        throw new Error(
          `パスワードリセットメールの送信に失敗しました: ${error.message}`
        );
      }
    } catch (error) {
      throw new Error(
        `パスワードリセット処理中にエラーが発生しました: ${error}`
      );
    }
  }

  /**
   * 生データをレスポンスDTOに変換
   */
  private mapRawDataToResponseDto(rawData: UserRawData[]): UserResponseDto[] {
    return rawData.map(user => ({
      id: user.id,
      email: user.email || '',
      name: user.name,
      role: user.role,
      facility_id: user.facility_id || undefined,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));
  }
}
