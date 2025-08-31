'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle } from 'lucide-react';

interface SessionWarningProps {
  isOpen: boolean;
  remainingMinutes: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionWarning({
  isOpen,
  remainingMinutes,
  onExtend,
  onLogout,
}: SessionWarningProps) {
  const [timeLeft, setTimeLeft] = useState(remainingMinutes);
  const [progress, setProgress] = useState(100);

  // remainingMinutesが変更されたときにtimeLeftを更新
  useEffect(() => {
    setTimeLeft(remainingMinutes);
    setProgress(100);
  }, [remainingMinutes]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - 1);
        const newProgress = Math.max(0, (newTime / remainingMinutes) * 100);
        setProgress(newProgress);

        if (newTime === 0) {
          onLogout();
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, remainingMinutes, onLogout]);

  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExtend = () => {
    onExtend();
  };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span>セッションタイムアウトの警告</span>
          </DialogTitle>
          <DialogDescription>
            長時間操作が行われていないため、セキュリティのためセッションが終了します。
            作業を続ける場合は「セッション延長」をクリックしてください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>残り時間</span>
            </span>
            <span className="font-mono text-lg font-semibold text-red-600">
              {formatTime(timeLeft)}
            </span>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="text-xs text-gray-500 text-center">
            {timeLeft === 0 ? (
              <span className="text-red-600 font-semibold">
                セッションが終了しました
              </span>
            ) : (
              <span>残り {timeLeft} 分でセッションが終了します</span>
            )}
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-gray-600"
          >
            ログアウト
          </Button>
          <Button
            onClick={handleExtend}
            disabled={timeLeft === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            セッション延長
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
