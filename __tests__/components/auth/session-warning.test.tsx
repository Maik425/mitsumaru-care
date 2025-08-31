import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionWarning } from '../../../src/components/auth/session-warning';

// タイマーをモック
jest.useFakeTimers();

const defaultProps = {
  isOpen: true,
  remainingMinutes: 5,
  onExtend: jest.fn(),
  onLogout: jest.fn(),
};

describe('SessionWarning', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('警告ダイアログが正しく表示される', () => {
    render(<SessionWarning {...defaultProps} />);

    expect(
      screen.getByText('セッションタイムアウトの警告')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/長時間操作が行われていないため/)
    ).toBeInTheDocument();
    expect(screen.getByText('セッション延長')).toBeInTheDocument();
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
  });

  it('残り時間が正しく表示される', () => {
    render(<SessionWarning {...defaultProps} remainingMinutes={5} />);

    // 初期状態では5分が表示される
    expect(screen.getByText('5:00')).toBeInTheDocument();
  });

  it('時間表示のフォーマットが正しい', () => {
    const { rerender } = render(
      <SessionWarning {...defaultProps} remainingMinutes={2.5} />
    );

    // 2分30秒
    expect(screen.getByText('2:30')).toBeInTheDocument();

    // 1分45秒
    rerender(<SessionWarning {...defaultProps} remainingMinutes={1.75} />);
    expect(screen.getByText('1:45')).toBeInTheDocument();

    // 0分30秒
    rerender(<SessionWarning {...defaultProps} remainingMinutes={0.5} />);
    expect(screen.getByText('0:30')).toBeInTheDocument();
  });

  it('プログレスバーが表示される', () => {
    render(<SessionWarning {...defaultProps} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('セッション延長ボタンがクリックできる', () => {
    render(<SessionWarning {...defaultProps} />);

    const extendButton = screen.getByText('セッション延長');
    fireEvent.click(extendButton);

    expect(defaultProps.onExtend).toHaveBeenCalledTimes(1);
  });

  it('ログアウトボタンがクリックできる', () => {
    render(<SessionWarning {...defaultProps} />);

    const logoutButton = screen.getByText('ログアウト');
    fireEvent.click(logoutButton);

    expect(defaultProps.onLogout).toHaveBeenCalledTimes(1);
  });

  it('残り時間の説明文が正しく表示される', () => {
    render(<SessionWarning {...defaultProps} remainingMinutes={3} />);

    expect(
      screen.getByText(/残り 3 分でセッションが終了します/)
    ).toBeInTheDocument();
  });

  it('ダイアログが閉じている場合は何も表示されない', () => {
    render(<SessionWarning {...defaultProps} isOpen={false} />);

    expect(
      screen.queryByText('セッションタイムアウトの警告')
    ).not.toBeInTheDocument();
  });
});
