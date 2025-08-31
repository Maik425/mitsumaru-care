import React from 'react';
import { render, screen } from '@testing-library/react';
import { Layout } from '../../../src/components/layout/layout';

// Headerコンポーネントのモック
jest.mock('../../../src/components/layout/header', () => ({
  Header: () => <div data-testid="mock-header">Mock Header</div>,
}));

// Sidebarコンポーネントのモック
jest.mock('../../../src/components/layout/sidebar', () => ({
  Sidebar: () => <div data-testid="mock-sidebar">Mock Sidebar</div>,
}));

describe('Layout', () => {
  it('ヘッダーとメインコンテンツが正しく表示される', () => {
    render(
      <Layout>
        <div>テストコンテンツ</div>
      </Layout>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });

  it('mainタグが正しくレンダリングされる', () => {
    render(
      <Layout>
        <div>テストコンテンツ</div>
      </Layout>
    );

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('flex-1', 'lg:ml-0');
  });

  it('メインコンテンツのコンテナが正しいクラスを持つ', () => {
    render(
      <Layout>
        <div>テストコンテンツ</div>
      </Layout>
    );

    // 実際のレイアウト構造を確認
    const mainElement = screen.getByRole('main');
    const containerElement = mainElement.querySelector('div');
    expect(containerElement).toHaveClass(
      'container',
      'mx-auto',
      'px-4',
      'py-6'
    );
  });

  it('複数の子要素が正しく表示される', () => {
    render(
      <Layout>
        <h1>タイトル</h1>
        <p>説明文</p>
        <button>ボタン</button>
      </Layout>
    );

    expect(screen.getByText('タイトル')).toBeInTheDocument();
    expect(screen.getByText('説明文')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ボタン' })).toBeInTheDocument();
  });

  it('空の子要素でも正しく動作する', () => {
    render(<Layout>{null}</Layout>);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('モバイルサイドバートグルボタンが表示される', () => {
    render(
      <Layout>
        <div>テストコンテンツ</div>
      </Layout>
    );

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });
});
