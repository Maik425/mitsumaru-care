#!/usr/bin/env node

/**
 * 開発用テストユーザー作成スクリプト
 *
 * 使用方法:
 * 1. .envファイルにSUPABASE_URLとSUPABASE_SERVICE_ROLE_KEYを設定
 * 2. node scripts/create-test-users.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertUserData(userId, user) {
  try {
    const { error } = await supabase.from('users').upsert({
      id: userId,
      email: user.email,
      name: user.user_metadata.name,
      role: user.user_metadata.role,
      facility_id: user.facility_id,
    });

    if (error) {
      console.log(`   ⚠️  usersテーブル挿入エラー: ${error.message}`);
    } else {
      console.log(`   ✅ usersテーブルにデータ挿入完了`);
    }
  } catch (err) {
    console.log(`   ⚠️  usersテーブル挿入エラー: ${err.message}`);
  }
}

const testUsers = [
  {
    email: 'admin@mitsumaru-care.com',
    password: 'password123',
    user_metadata: {
      name: 'システム管理者',
      role: 'system_admin',
    },
    facility_id: null,
  },
  {
    email: 'facility1@mitsumaru-care.com',
    password: 'password123',
    user_metadata: {
      name: '施設管理者1',
      role: 'facility_admin',
    },
    facility_id: '550e8400-e29b-41d4-a716-446655440001',
  },
  {
    email: 'user1@mitsumaru-care.com',
    password: 'password123',
    user_metadata: {
      name: '職員1',
      role: 'user',
    },
    facility_id: '550e8400-e29b-41d4-a716-446655440001',
  },
  {
    email: 'sk8maiki0425@gmail.com',
    password: 'password123',
    user_metadata: {
      name: 'テストユーザー1',
      role: 'user',
    },
    facility_id: '550e8400-e29b-41d4-a716-446655440001',
  },
  {
    email: 'takano@bizmarq.com',
    password: 'password123',
    user_metadata: {
      name: 'テストユーザー2',
      role: 'facility_admin',
    },
    facility_id: '550e8400-e29b-41d4-a716-446655440001',
  },
];

async function createTestUsers() {
  console.log('🚀 開発用テストユーザーを作成中...\n');

  for (const user of testUsers) {
    try {
      console.log(`📝 ユーザー作成中: ${user.email}`);

      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.user_metadata,
      });

      if (error) {
        if (
          error.message.includes('already registered') ||
          error.message.includes('already been registered')
        ) {
          console.log(`   ⚠️  既に存在: ${user.email}`);
          // 既存ユーザーの場合、usersテーブルにデータを挿入
          const { data: existingUser } = await supabase.auth.admin.listUsers();
          const foundUser = existingUser.users.find(
            u => u.email === user.email
          );
          if (foundUser) {
            await insertUserData(foundUser.id, user);
          }
        } else {
          console.error(`   ❌ エラー: ${error.message}`);
        }
      } else {
        console.log(`   ✅ 作成完了: ${user.email} (ID: ${data.user.id})`);
        // 新規ユーザーの場合、usersテーブルにデータを挿入
        await insertUserData(data.user.id, user);
      }
    } catch (err) {
      console.error(`   ❌ 予期しないエラー: ${err.message}`);
    }
  }

  console.log('\n🎉 テストユーザー作成処理が完了しました！');
  console.log('\n📋 作成されたユーザー:');
  testUsers.forEach(user => {
    console.log(
      `   • ${user.email} (${user.user_metadata.role}) - パスワード: ${user.password}`
    );
  });
}

createTestUsers().catch(console.error);
