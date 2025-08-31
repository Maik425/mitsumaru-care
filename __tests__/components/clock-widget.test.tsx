import { render, screen } from '@testing-library/react';
import { ClockWidget } from '../../components/clock-widget';

describe('ClockWidget', () => {
  it('renders clock widget with current time', () => {
    render(<ClockWidget />);

    // 打刻の要素が表示されることを確認
    expect(screen.getByText(/本日の予定/)).toBeInTheDocument();
  });

  it('displays time in correct format', () => {
    render(<ClockWidget />);

    // 時刻が表示されることを確認
    const timeElement = screen.getByText(/\d{1,2}:\d{2}:\d{2}/);
    expect(timeElement).toBeInTheDocument();
  });

  it('displays today schedule information', () => {
    render(<ClockWidget />);

    // スケジュール情報が表示されることを確認
    expect(screen.getByText(/シフト:/)).toBeInTheDocument();
    expect(screen.getByText(/日勤/)).toBeInTheDocument();
    expect(screen.getByText(/勤務時間:/)).toBeInTheDocument();
    expect(screen.getByText(/09:00/)).toBeInTheDocument();
    expect(screen.getByText(/18:00/)).toBeInTheDocument();
    expect(screen.getByText(/休憩時間:/)).toBeInTheDocument();
    expect(screen.getByText(/12:00-13:00/)).toBeInTheDocument();
  });

  it('shows clock in button initially', () => {
    render(<ClockWidget />);

    // 初期状態で出勤打刻ボタンが表示されることを確認
    expect(screen.getByText(/出勤打刻/)).toBeInTheDocument();
  });

  it('has correct card structure', () => {
    render(<ClockWidget />);

    // カードの構造が正しいことを確認
    expect(screen.getByText(/本日の予定/)).toBeInTheDocument();
  });
});
