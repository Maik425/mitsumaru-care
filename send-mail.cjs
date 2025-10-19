const nodemailer = require('nodemailer');
require('dotenv').config();

// 環境変数の取得
const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
const fromAddress = process.env.GMAIL_FROM_ADDRESS;

// 環境変数の検証
if (!gmailUser || !gmailAppPassword || !fromAddress) {
  console.error('❌ 必要な環境変数が設定されていません:');
  console.error('GMAIL_USER:', gmailUser ? '✅' : '❌');
  console.error('GMAIL_APP_PASSWORD:', gmailAppPassword ? '✅' : '❌');
  console.error('GMAIL_FROM_ADDRESS:', fromAddress ? '✅' : '❌');
  process.exit(1);
}

// Gmail SMTPトランスポーターの設定
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // STARTTLSを使用
  auth: {
    user: gmailUser,
    pass: gmailAppPassword,
  },
  tls: {
    // 本番環境での堅牢性を向上
    rejectUnauthorized: true,
    ciphers: 'SSLv3',
  },
});

// メール送信関数
async function sendTestEmail() {
  try {
    console.log('📧 メール送信を開始します...');
    console.log('送信元:', fromAddress);
    console.log('認証ユーザー:', gmailUser);

    // テストメールの設定
    const mailOptions = {
      from: {
        name: 'みつまるケア システム',
        address: fromAddress,
      },
      to: 'takano@bizmarq.com', // テスト用の受信者
      subject: '【テスト】みつまるケア システム通知',
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">みつまるケア システム通知</h2>
                    <p>これはシステム通知機能のテストメールです。</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3>送信情報</h3>
                        <ul>
                            <li><strong>送信日時:</strong> ${new Date().toLocaleString('ja-JP')}</li>
                            <li><strong>送信元:</strong> ${fromAddress}</li>
                            <li><strong>認証ユーザー:</strong> ${gmailUser}</li>
                        </ul>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">
                        このメールは自動送信されています。返信は不要です。
                    </p>
                </div>
            `,
      text: `
みつまるケア システム通知

これはシステム通知機能のテストメールです。

送信情報:
- 送信日時: ${new Date().toLocaleString('ja-JP')}
- 送信元: ${fromAddress}
- 認証ユーザー: ${gmailUser}

このメールは自動送信されています。返信は不要です。
            `,
    };

    // メール送信
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ メール送信が完了しました！');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 受信者:', mailOptions.to);
    console.log('📤 送信元:', mailOptions.from.address);
    console.log('⏰ 送信時刻:', new Date().toLocaleString('ja-JP'));

    // 送信結果の詳細情報
    if (info.accepted && info.accepted.length > 0) {
      console.log('✅ 受信者（承認済み）:', info.accepted.join(', '));
    }
    if (info.rejected && info.rejected.length > 0) {
      console.log('❌ 受信者（拒否）:', info.rejected.join(', '));
    }

    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    console.error('❌ メール送信に失敗しました:', error.message);

    // エラーの詳細情報
    if (error.code) {
      console.error('エラーコード:', error.code);
    }
    if (error.response) {
      console.error('SMTP応答:', error.response);
    }
    if (error.responseCode) {
      console.error('応答コード:', error.responseCode);
    }

    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
}

// SMTP接続のテスト
async function testSMTPConnection() {
  try {
    console.log('🔗 SMTP接続をテストしています...');
    await transporter.verify();
    console.log('✅ SMTP接続が正常です');
    return true;
  } catch (error) {
    console.error('❌ SMTP接続に失敗しました:', error.message);
    return false;
  }
}

// メイン実行関数
async function main() {
  console.log('🚀 みつまるケア メール送信テストを開始します');
  console.log('='.repeat(50));

  // SMTP接続テスト
  const connectionOk = await testSMTPConnection();
  if (!connectionOk) {
    console.log('❌ SMTP接続に失敗したため、メール送信を中止します');
    process.exit(1);
  }

  console.log('');

  // メール送信テスト
  const result = await sendTestEmail();

  console.log('');
  console.log('='.repeat(50));

  if (result.success) {
    console.log('🎉 メール送信テストが完了しました！');
    console.log('📧 Message ID:', result.messageId);
  } else {
    console.log('💥 メール送信テストが失敗しました');
    console.log('❌ エラー:', result.error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(error => {
    console.error('💥 予期しないエラーが発生しました:', error);
    process.exit(1);
  });
}

module.exports = {
  sendTestEmail,
  testSMTPConnection,
  transporter,
};
