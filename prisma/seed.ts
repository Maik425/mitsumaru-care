import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🌱 認証システムの初期データを作成中...');

    // 基本権限の作成
    console.log('権限を作成中...');

    const userManagementPermission = await prisma.permission.upsert({
      where: { name: 'USER_MANAGEMENT' },
      update: {},
      create: {
        name: 'USER_MANAGEMENT',
        description: 'ユーザーの作成・編集・削除',
        category: 'USER_ADMIN',
      },
    });
    console.log('✅ USER_MANAGEMENT権限作成完了');

    const systemSettingsPermission = await prisma.permission.upsert({
      where: { name: 'SYSTEM_SETTINGS' },
      update: {},
      create: {
        name: 'SYSTEM_SETTINGS',
        description: 'システム設定の変更',
        category: 'SYSTEM_ADMIN',
      },
    });
    console.log('✅ SYSTEM_SETTINGS権限作成完了');

    const shiftManagementPermission = await prisma.permission.upsert({
      where: { name: 'SHIFT_MANAGEMENT' },
      update: {},
      create: {
        name: 'SHIFT_MANAGEMENT',
        description: 'シフトの作成・編集・削除',
        category: 'SHIFT_ADMIN',
      },
    });
    console.log('✅ SHIFT_MANAGEMENT権限作成完了');

    const shiftViewPermission = await prisma.permission.upsert({
      where: { name: 'SHIFT_VIEW' },
      update: {},
      create: {
        name: 'SHIFT_VIEW',
        description: 'シフトの閲覧',
        category: 'SHIFT_USER',
      },
    });
    console.log('✅ SHIFT_VIEW権限作成完了');

    const attendanceManagementPermission = await prisma.permission.upsert({
      where: { name: 'ATTENDANCE_MANAGEMENT' },
      update: {},
      create: {
        name: 'ATTENDANCE_MANAGEMENT',
        description: '勤怠の管理・承認',
        category: 'ATTENDANCE_ADMIN',
      },
    });
    console.log('✅ ATTENDANCE_MANAGEMENT権限作成完了');

    const attendanceUpdatePermission = await prisma.permission.upsert({
      where: { name: 'ATTENDANCE_UPDATE' },
      update: {},
      create: {
        name: 'ATTENDANCE_UPDATE',
        description: '自分の勤怠の更新',
        category: 'ATTENDANCE_USER',
      },
    });
    console.log('✅ ATTENDANCE_UPDATE権限作成完了');

    const roleManagementPermission = await prisma.permission.upsert({
      where: { name: 'ROLE_MANAGEMENT' },
      update: {},
      create: {
        name: 'ROLE_MANAGEMENT',
        description: 'ロール・権限の管理',
        category: 'SYSTEM_ADMIN',
      },
    });
    console.log('✅ ROLE_MANAGEMENT権限作成完了');

    const permissions = [
      userManagementPermission,
      systemSettingsPermission,
      shiftManagementPermission,
      shiftViewPermission,
      attendanceManagementPermission,
      attendanceUpdatePermission,
      roleManagementPermission,
    ];

    console.log('✅ 権限の作成完了:', permissions.length);

    // 基本ロールの作成
    console.log('ロールを作成中...');

    const systemAdminRole = await prisma.role.upsert({
      where: { name: 'SYSTEM_ADMIN' },
      update: {},
      create: {
        name: 'SYSTEM_ADMIN',
        description: 'システム全体の管理者',
      },
    });
    console.log('✅ SYSTEM_ADMINロール作成完了');

    const facilityAdminRole = await prisma.role.upsert({
      where: { name: 'FACILITY_ADMIN' },
      update: {},
      create: {
        name: 'FACILITY_ADMIN',
        description: '施設の管理者',
      },
    });
    console.log('✅ FACILITY_ADMINロール作成完了');

    const facilityStaffRole = await prisma.role.upsert({
      where: { name: 'FACILITY_STAFF' },
      update: {},
      create: {
        name: 'FACILITY_STAFF',
        description: '施設の一般職員',
      },
    });
    console.log('✅ FACILITY_STAFFロール作成完了');

    const roles = [systemAdminRole, facilityAdminRole, facilityStaffRole];

    console.log('✅ ロールの作成完了:', roles.length);

    // ロールと権限の関連付け
    console.log('ロールと権限の関連付け中...');

    // システムアドミン: すべての権限
    console.log('システムアドミンに権限を付与中...');
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: systemAdminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: systemAdminRole.id,
          permissionId: permission.id,
        },
      });
      console.log(`✅ ${permission.name}権限をシステムアドミンに付与完了`);
    }

    // 施設管理者: 施設管理に必要な権限
    console.log('施設管理者に権限を付与中...');
    const facilityAdminPermissions = permissions.filter(p =>
      [
        'SHIFT_MANAGEMENT',
        'SHIFT_VIEW',
        'ATTENDANCE_MANAGEMENT',
        'ATTENDANCE_UPDATE',
      ].includes(p.name)
    );
    for (const permission of facilityAdminPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: facilityAdminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: facilityAdminRole.id,
          permissionId: permission.id,
        },
      });
      console.log(`✅ ${permission.name}権限を施設管理者に付与完了`);
    }

    // 施設職員: 基本的な閲覧・更新権限
    console.log('施設職員に権限を付与中...');
    const facilityStaffPermissions = permissions.filter(p =>
      ['SHIFT_VIEW', 'ATTENDANCE_UPDATE'].includes(p.name)
    );
    for (const permission of facilityStaffPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: facilityStaffRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: facilityStaffRole.id,
          permissionId: permission.id,
        },
      });
      console.log(`✅ ${permission.name}権限を施設職員に付与完了`);
    }

    console.log('✅ ロール権限の関連付け完了');

    // サンプルユーザーの作成
    console.log('サンプルユーザーを作成中...');

    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@mitsumaru.com' },
      update: {},
      create: {
        email: 'admin@mitsumaru.com',
        name: 'システム管理者',
        employeeNumber: 'ADMIN001',
        phoneNumber: '090-0000-0001',
      },
    });
    console.log('✅ システム管理者ユーザー作成完了');

    const facilityAdminUser = await prisma.user.upsert({
      where: { email: 'facility-admin@mitsumaru.com' },
      update: {},
      create: {
        email: 'facility-admin@mitsumaru.com',
        name: '施設管理者',
        employeeNumber: 'FAC001',
        phoneNumber: '090-0000-0002',
      },
    });
    console.log('✅ 施設管理者ユーザー作成完了');

    const staffUser = await prisma.user.upsert({
      where: { email: 'staff@mitsumaru.com' },
      update: {},
      create: {
        email: 'staff@mitsumaru.com',
        name: '一般職員',
        employeeNumber: 'STAFF001',
        phoneNumber: '090-0000-0003',
      },
    });
    console.log('✅ 一般職員ユーザー作成完了');

    const sampleUsers = [adminUser, facilityAdminUser, staffUser];

    console.log('✅ サンプルユーザーの作成完了:', sampleUsers.length);

    // デフォルトテナントの作成
    console.log('デフォルトテナントを作成中...');
    const defaultTenant = await prisma.tenant.upsert({
      where: { id: 'default-tenant-id' },
      update: {},
      create: {
        id: 'default-tenant-id',
        name: 'みつまるケア本社',
        address: '東京都渋谷区',
        phoneNumber: '03-0000-0000',
      },
    });
    console.log('✅ デフォルトテナント作成完了');

    // ユーザーとロールの関連付け
    console.log('ユーザーとロールの関連付け中...');

    await prisma.userRoleAssignment.upsert({
      where: {
        userId_roleId_tenantId: {
          userId: adminUser.id,
          roleId: systemAdminRole.id,
          tenantId: defaultTenant.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: systemAdminRole.id,
        tenantId: defaultTenant.id,
      },
    });
    console.log('✅ システム管理者のロール関連付け完了');

    await prisma.userRoleAssignment.upsert({
      where: {
        userId_roleId_tenantId: {
          userId: facilityAdminUser.id,
          roleId: facilityAdminRole.id,
          tenantId: defaultTenant.id,
        },
      },
      update: {},
      create: {
        userId: facilityAdminUser.id,
        roleId: facilityAdminRole.id,
        tenantId: defaultTenant.id,
      },
    });
    console.log('✅ 施設管理者のロール関連付け完了');

    await prisma.userRoleAssignment.upsert({
      where: {
        userId_roleId_tenantId: {
          userId: staffUser.id,
          roleId: facilityStaffRole.id,
          tenantId: defaultTenant.id,
        },
      },
      update: {},
      create: {
        userId: staffUser.id,
        roleId: facilityStaffRole.id,
        tenantId: defaultTenant.id,
      },
    });
    console.log('✅ 一般職員のロール関連付け完了');

    console.log('✅ ユーザーロールの関連付け完了');

    // シフト交換のテストデータを作成
    console.log('シフト交換のテストデータを作成中...');

    const shiftExchange = await prisma.shiftExchange.upsert({
      where: { id: 'test-exchange-001' },
      update: {},
      create: {
        id: 'test-exchange-001',
        requesterId: staffUser.id,
        partnerId: facilityAdminUser.id,
        fromDate: new Date('2025-03-15'),
        toDate: new Date('2025-03-16'),
        reason: 'テスト用のシフト交換申請',
        status: 'pending',
      },
    });
    console.log('✅ シフト交換テストデータ作成完了:', shiftExchange.id);

    console.log('🎉 認証システムの初期データ作成完了！');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error('❌ エラーが発生しました:', e);
  process.exit(1);
});
