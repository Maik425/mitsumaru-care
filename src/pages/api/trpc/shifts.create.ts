import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 未認証 or 直接アクセスは403を返す（テスト用モック）
  res.status(403).json({ error: 'Forbidden' });
}
