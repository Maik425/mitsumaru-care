"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

export function ClockWidget() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString("ja-JP", { hour12: false }))
  const [isWorking, setIsWorking] = useState(false)

  // 現在時刻を更新
  useState(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("ja-JP", { hour12: false }))
    }, 1000)
    return () => clearInterval(timer)
  })

  const todaySchedule = {
    shift: "日勤",
    startTime: "09:00",
    endTime: "18:00",
    breakTime: "12:00-13:00",
  }

  const handleClockIn = () => {
    setIsWorking(true)
    // 実際の実装では、ここでAPIを呼び出して打刻を記録
  }

  const handleClockOut = () => {
    setIsWorking(false)
    // 実際の実装では、ここでAPIを呼び出して打刻を記録
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          打刻
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="mb-6">
          <p className="text-3xl font-bold text-gray-900 mb-2">{currentTime}</p>
          <p className="text-gray-600">{new Date().toLocaleDateString("ja-JP")}</p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">本日の予定</h3>
          <div className="text-sm text-blue-700">
            <p>
              <strong>シフト:</strong> {todaySchedule.shift}
            </p>
            <p>
              <strong>勤務時間:</strong> {todaySchedule.startTime} - {todaySchedule.endTime}
            </p>
            <p>
              <strong>休憩時間:</strong> {todaySchedule.breakTime}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {!isWorking ? (
            <Button onClick={handleClockIn} className="w-full h-12 text-lg bg-green-600 hover:bg-green-700">
              出勤打刻
            </Button>
          ) : (
            <Button onClick={handleClockOut} className="w-full h-12 text-lg bg-red-600 hover:bg-red-700">
              退勤打刻
            </Button>
          )}
        </div>

        {isWorking && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 font-medium">勤務中</p>
            <p className="text-sm text-green-600">出勤時刻: 09:00</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
