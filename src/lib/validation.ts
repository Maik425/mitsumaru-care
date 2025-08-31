export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  // より厳密なメールアドレス正規表現（連続するドットを禁止）
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const trimmedEmail = email.trim();

  // 連続するドットをチェック
  if (trimmedEmail.includes('..')) {
    return {
      isValid: false,
      errors: ['有効なメールアドレスを入力してください'],
    };
  }

  const isValid = emailRegex.test(trimmedEmail);

  return {
    isValid,
    errors: isValid ? [] : ['有効なメールアドレスを入力してください'],
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('パスワードは8文字以上である必要があります');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('大文字を含む必要があります');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('小文字を含む必要があります');
  }

  if (!/\d/.test(password)) {
    errors.push('数字を含む必要があります');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('特殊文字を含む必要があります');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
