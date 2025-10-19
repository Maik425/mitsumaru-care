import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const fromAddress = process.env.GMAIL_FROM_ADDRESS;

    if (!gmailUser || !gmailAppPassword || !fromAddress) {
      throw new Error('Gmail認証情報が設定されていません');
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLSを使用
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
      tls: {
        rejectUnauthorized: true,
        ciphers: 'SSLv3',
      },
    });
  }

  async sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const fromAddress = process.env.GMAIL_FROM_ADDRESS;
      if (!fromAddress) {
        throw new Error('送信元アドレスが設定されていません');
      }

      const mailOptions = {
        from: {
          name: options.fromName || 'みつまるケア システム',
          address: fromAddress,
        },
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('メール送信エラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendNotificationEmail(
    recipientEmail: string,
    recipientName: string,
    template: {
      subject: string;
      body: string;
      variables?: Record<string, string>;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // テンプレート変数の置換
    let subject = template.subject;
    let body = template.body;

    if (template.variables) {
      Object.entries(template.variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
        body = body.replace(new RegExp(placeholder, 'g'), value);
      });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">みつまるケア システム通知</h2>
        <p>${recipientName}様</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${body.replace(/\n/g, '<br>')}
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          このメールは自動送信されています。返信は不要です。
        </p>
      </div>
    `;

    const text = `
みつまるケア システム通知

${recipientName}様

${body}

このメールは自動送信されています。返信は不要です。
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject,
      html,
      text,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP接続テストエラー:', error);
      return false;
    }
  }
}

// シングルトンインスタンス
export const emailService = new EmailService();

