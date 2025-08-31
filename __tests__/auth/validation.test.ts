import { validateEmail, validatePassword } from '../../src/lib/validation';

describe('バリデーション関数', () => {
  describe('validateEmail', () => {
    it('有効なメールアドレスを正しく検証する', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.jp',
        'user+tag@example.org',
        '123@numbers.com',
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('無効なメールアドレスを正しく検証する', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user@example..com',
        '',
        '   ',
        'user@example',
        'user@.com',
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        if (result.isValid) {
          console.log(`Unexpectedly valid email: "${email}"`);
        }
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          '有効なメールアドレスを入力してください'
        );
      });
    });

    it('空文字列とnullを正しく処理する', () => {
      const result1 = validateEmail('');
      expect(result1.isValid).toBe(false);

      const result2 = validateEmail('   ');
      expect(result2.isValid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('有効なパスワードを正しく検証する', () => {
      const validPasswords = [
        'Password123!',
        'SecurePass456@',
        'MyP@ssw0rd',
        'Str0ng#Pass',
      ];

      validPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('最小文字数未満のパスワードを検証する', () => {
      const shortPasswords = ['Pass1!', 'Abc12', 'Test@'];

      shortPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'パスワードは8文字以上である必要があります'
        );
      });
    });

    it('大文字を含まないパスワードを検証する', () => {
      const noUppercasePasswords = [
        'password123!',
        'mypass456@',
        'securepass789#',
      ];

      noUppercasePasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('大文字を含む必要があります');
      });
    });

    it('小文字を含まないパスワードを検証する', () => {
      const noLowercasePasswords = [
        'PASSWORD123!',
        'MYPASS456@',
        'SECUREPASS789#',
      ];

      noLowercasePasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('小文字を含む必要があります');
      });
    });

    it('数字を含まないパスワードを検証する', () => {
      const noNumberPasswords = ['Password!', 'SecurePass@', 'MyPassword#'];

      noNumberPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('数字を含む必要があります');
      });
    });

    it('特殊文字を含まないパスワードを検証する', () => {
      const noSpecialCharPasswords = [
        'Password123',
        'SecurePass456',
        'MyPassword789',
      ];

      noSpecialCharPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('特殊文字を含む必要があります');
      });
    });

    it('複数の要件を満たさないパスワードのエラーメッセージを確認する', () => {
      const invalidPassword = 'pass';
      const result = validatePassword(invalidPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4);
      expect(result.errors).toContain(
        'パスワードは8文字以上である必要があります'
      );
      expect(result.errors).toContain('大文字を含む必要があります');
      expect(result.errors).toContain('数字を含む必要があります');
      expect(result.errors).toContain('特殊文字を含む必要があります');
    });

    it('空文字列とnullを正しく処理する', () => {
      const result1 = validatePassword('');
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain(
        'パスワードは8文字以上である必要があります'
      );

      const result2 = validatePassword('   ');
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain(
        'パスワードは8文字以上である必要があります'
      );
    });
  });
});
