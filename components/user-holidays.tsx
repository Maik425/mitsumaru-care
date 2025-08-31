"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, Plus, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"

const myRequests = [
  {
    id: 1,
    dates: ["2023-10-01", "2023-10-02"],
    submittedAt: "2023-09-15",
    status: "approved",
    type: "regular",
    approvedAt: "2023-09-20",
    reason: "",
    rejectReason: "",
  },
  {
    id: 2,
    dates: ["2023-11-01"],
    submittedAt: "2023-10-10",
    status: "pending",
    type: "exchange",
    approvedAt: "",
    reason: "家族訪問",
    rejectReason: "",
  },
  // Add more requests as needed
]

export function UserHolidays() {
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [exchangeDates, setExchangeDates] = useState<string[]>([])
  const [reason, setReason] = useState("")
  const [exchangeReason, setExchangeReason] = useState("")

  const getCurrentDeadline = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // 毎月20日が翌月分の提出期限
    const deadline = new Date(currentYear, currentMonth, 20)
    const targetMonth = new Date(currentYear, currentMonth + 1, 1)

    return {
      deadline,
      targetMonth,
      isPastDeadline: now > deadline,
    }
  }

  const { deadline, targetMonth, isPastDeadline } = getCurrentDeadline()

  const isDateAllowedForRegular = (dateString: string) => {
    const selectedDate = new Date(dateString)
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const nextMonth = new Date(currentYear, currentMonth + 1, 1)

    // 今月は申請不可、来月以降のみ申請可能
    return selectedDate >= nextMonth
  }

  const isDateAllowedForExchange = (dateString: string) => {
    const selectedDate = new Date(dateString)
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const thisMonth = new Date(currentYear, currentMonth, 1)
    const nextMonth = new Date(currentYear, currentMonth + 1, 1)
    const monthAfterNext = new Date(currentYear, currentMonth + 2, 1)

    // 今月は常に選択可能
    if (selectedDate >= thisMonth && selectedDate < nextMonth) {
      return true
    }

    // 期限切れの場合は来月も選択可能
    if (isPastDeadline && selectedDate >= nextMonth && selectedDate < monthAfterNext) {
      return true
    }

    return false
  }

  const addDate = (date: string) => {
    if (!selectedDates.includes(date) && isDateAllowedForRegular(date)) {
      setSelectedDates([...selectedDates, date])
    }
  }

  const removeDate = (date: string) => {
    setSelectedDates(selectedDates.filter((d) => d !== date))
  }

  const addExchangeDate = (date: string) => {
    if (!exchangeDates.includes(date) && isDateAllowedForExchange(date)) {
      setExchangeDates([...exchangeDates, date])
    }
  }

  const removeExchangeDate = (date: string) => {
    setExchangeDates(exchangeDates.filter((d) => d !== date))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("休暇申請:", {
      dates: selectedDates,
      reason,
      type: "regular",
    })
    setSelectedDates([])
    setReason("")
  }

  const handleExchangeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("交換希望申請:", {
      dates: exchangeDates,
      reason: exchangeReason,
      type: "exchange",
    })
    setExchangeDates([])
    setExchangeReason("")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            承認済み
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            却下
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            承認待ち
          </Badge>
        )
      default:
        return null
    }
  }

  const getRequestTypeBadge = (type: string) => {
    switch (type) {
      case "exchange":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            交換希望休
          </Badge>
        )
      case "regular":
        return <Badge className="bg-blue-100 text-blue-800">希望休</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/user/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ダッシュボードに戻る
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 ml-4">希望休入力</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isPastDeadline && (
          <div className="mb-6">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-orange-900 mb-1">提出期限を過ぎています</h3>
                    <p className="text-sm text-orange-700 mb-2">
                      {targetMonth.toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}分の希望休提出期限 （
                      {deadline.toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}）を過ぎています。
                    </p>
                    <p className="text-sm text-orange-700">
                      今月と来月の日付については、下記の「交換希望申請」をご利用ください。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  新しい休暇申請
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="date">希望日を追加（来月以降）</Label>
                    <div className="relative">
                      <Input
                        id="date"
                        type="date"
                        className="relative z-50 bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 shadow-sm hover:shadow-md transition-all duration-200"
                        style={{
                          colorScheme: "light",
                        }}
                        onChange={(e) => {
                          if (e.target.value) {
                            if (isDateAllowedForRegular(e.target.value)) {
                              addDate(e.target.value)
                            } else {
                              alert("来月以降の日付を選択してください。今月の申請は交換希望申請をご利用ください。")
                            }
                            e.target.value = ""
                          }
                        }}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {selectedDates.length > 0 && (
                    <div>
                      <Label>選択された日付</Label>
                      <div className="mt-2 space-y-2">
                        {selectedDates.map((date) => (
                          <div key={date} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                            <span>
                              {new Date(date).toLocaleDateString("ja-JP", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                weekday: "short",
                              })}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDate(date)}
                              className="text-red-600 hover:text-red-700"
                            >
                              削除
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">希望休では個人の尊重として理由の記載は不要です。</p>
                  </div>

                  <Button type="submit" className="w-full" disabled={selectedDates.length === 0}>
                    申請を送信
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <h4 className="font-medium text-yellow-800 mb-2">新しい休暇申請について</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• 毎月20日までに翌月分以降を申請してください</li>
                    <li>• 今月の申請はできません（交換希望申請をご利用ください）</li>
                    <li>• 理由の記載は不要です</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  交換希望申請
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleExchangeSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="exchange-date">希望日を追加（今月{isPastDeadline ? "・来月" : ""}のみ）</Label>
                    <div className="relative">
                      <Input
                        id="exchange-date"
                        type="date"
                        className="relative z-50 bg-white border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:ring-opacity-50 shadow-sm hover:shadow-md transition-all duration-200"
                        style={{
                          colorScheme: "light",
                        }}
                        onChange={(e) => {
                          if (e.target.value) {
                            if (isDateAllowedForExchange(e.target.value)) {
                              addExchangeDate(e.target.value)
                            } else {
                              const allowedPeriod = isPastDeadline ? "今月・来月" : "今月"
                              alert(
                                `${allowedPeriod}の日付のみ選択可能です。再来月以降は新しい休暇申請をご利用ください。`,
                              )
                            }
                            e.target.value = ""
                          }
                        }}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {exchangeDates.length > 0 && (
                    <div>
                      <Label>選択された日付</Label>
                      <div className="mt-2 space-y-2">
                        {exchangeDates.map((date) => (
                          <div key={date} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                            <span>
                              {new Date(date).toLocaleDateString("ja-JP", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                weekday: "short",
                              })}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExchangeDate(date)}
                              className="text-red-600 hover:text-red-700"
                            >
                              削除
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="exchange-reason">理由</Label>
                    <Textarea
                      id="exchange-reason"
                      value={exchangeReason}
                      onChange={(e) => setExchangeReason(e.target.value)}
                      placeholder="交換希望の理由を入力してください（任意）"
                      className="min-h-[100px]"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      交換希望申請では、同じ技能を持つ職員との交換案が検討されます。
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={exchangeDates.length === 0}>
                    交換希望申請を送信
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded">
                  <h4 className="font-medium text-orange-800 mb-2">交換希望申請について</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• 今月の日付は常に申請可能です</li>
                    {isPastDeadline && <li>• 期限切れのため、来月の日付も申請可能です</li>}
                    <li>• 再来月以降は新しい休暇申請をご利用ください</li>
                    <li>• 理由の記載は任意です</li>
                    <li>• 同じ技能を持つ職員との交換が検討されます</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  申請履歴
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myRequests.map((request) => (
                    <div key={request.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">
                            {request.dates
                              .map((date) =>
                                new Date(date).toLocaleDateString("ja-JP", { month: "short", day: "numeric" }),
                              )
                              .join(", ")}
                          </h3>
                          <p className="text-sm text-gray-600">申請日: {request.submittedAt}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {getStatusBadge(request.status)}
                          {getRequestTypeBadge(request.type)}
                        </div>
                      </div>

                      {request.type === "exchange" && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">理由</p>
                          <p className="text-sm">{request.reason}</p>
                        </div>
                      )}

                      {request.status === "approved" && request.approvedAt && (
                        <p className="text-sm text-green-600">承認日: {request.approvedAt}</p>
                      )}

                      {request.status === "rejected" && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-800 font-medium">却下理由</p>
                          <p className="text-sm text-red-600">{request.rejectReason}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          right: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        
        input[type="date"]:focus::-webkit-calendar-picker-indicator {
          opacity: 0;
        }
        
        input[type="date"]::-webkit-datetime-edit {
          padding: 0;
        }
        
        /* カレンダーポップアップの z-index を高く設定 */
        input[type="date"]::-webkit-calendar-picker-indicator {
          z-index: 9999;
        }
      `}</style>
    </div>
  )
}
