"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Plus, Edit, Trash2, ClipboardList, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

export function AttendanceManagementSettings() {
  const [settings, setSettings] = useState([
    {
      id: 1,
      category: "勤怠ルール",
      name: "遅刻基準時間",
      value: "5分",
      description: "この時間を超えて遅刻した場合に遅刻として記録",
      status: "active",
    },
    {
      id: 2,
      category: "勤怠ルール",
      name: "早退基準時間",
      value: "10分",
      description: "予定終了時刻よりこの時間早く退勤した場合に早退として記録",
      status: "active",
    },
    {
      id: 3,
      category: "残業管理",
      name: "残業開始基準",
      value: "15分",
      description: "予定終了時刻からこの時間後に残業として計算開始",
      status: "active",
    },
    {
      id: 4,
      category: "休憩管理",
      name: "休憩時間の自動控除",
      value: "有効",
      description: "設定された休憩時間を自動的に労働時間から控除",
      status: "active",
    },
    {
      id: 5,
      category: "承認フロー",
      name: "勤怠承認者",
      value: "管理者",
      description: "勤怠記録の承認を行う権限者",
      status: "active",
    },
    {
      id: 6,
      category: "有給管理",
      name: "年次有給日数",
      value: "20日",
      description: "年間の有給休暇付与日数",
      status: "active",
    },
  ])

  const [formData, setFormData] = useState({
    category: "",
    name: "",
    value: "",
    description: "",
    status: "active",
  })

  const categories = ["勤怠ルール", "残業管理", "休憩管理", "承認フロー", "有給管理", "労働時間管理", "手当管理"]
  const statuses = ["active", "inactive"]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            有効
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            無効
          </Badge>
        )
      default:
        return null
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "勤怠ルール":
        return "bg-blue-100 text-blue-800"
      case "残業管理":
        return "bg-orange-100 text-orange-800"
      case "休憩管理":
        return "bg-green-100 text-green-800"
      case "承認フロー":
        return "bg-purple-100 text-purple-800"
      case "有給管理":
        return "bg-pink-100 text-pink-800"
      case "労働時間管理":
        return "bg-yellow-100 text-yellow-800"
      case "手当管理":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSave = () => {
    // 実際の実装では、ここでAPIを呼び出してデータを保存
    setFormData({ category: "", name: "", value: "", description: "", status: "active" })
  }

  const groupedSettings = settings.reduce(
    (acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(setting)
      return acc
    },
    {} as Record<string, typeof settings>,
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ダッシュボードに戻る
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 ml-4">勤怠管理登録</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  新しい勤怠設定
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category">カテゴリー</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリーを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="name">設定名</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例: 遅刻基準時間"
                    />
                  </div>

                  <div>
                    <Label htmlFor="value">設定値</Label>
                    <Input
                      id="value"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="例: 5分"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">説明</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="設定の詳細説明を入力してください"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="status"
                      checked={formData.status === "active"}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, status: checked ? "active" : "inactive" })
                      }
                    />
                    <Label htmlFor="status">有効にする</Label>
                  </div>

                  <Button onClick={handleSave} className="w-full">
                    設定を追加
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  勤怠管理の基本設定
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">自動承認機能</p>
                      <p className="text-sm text-gray-600">正常な勤怠記録を自動承認</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">打刻忘れ通知</p>
                      <p className="text-sm text-gray-600">打刻忘れをメールで通知</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">残業事前申請</p>
                      <p className="text-sm text-gray-600">残業には事前申請を必須とする</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">GPS打刻</p>
                      <p className="text-sm text-gray-600">指定場所でのみ打刻を許可</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  登録済み勤怠設定
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupedSettings).map(([category, categorySettings]) => (
                    <div key={category}>
                      <div className="flex items-center mb-3">
                        <Badge className={getCategoryColor(category)}>{category}</Badge>
                      </div>
                      <div className="space-y-3">
                        {categorySettings.map((setting) => (
                          <div key={setting.id} className="p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">{setting.name}</h4>
                                {getStatusBadge(setting.status)}
                              </div>
                              <div className="flex space-x-1">
                                <Button size="sm" variant="ghost">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-600">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm">
                              <p className="font-medium text-blue-600 mb-1">設定値: {setting.value}</p>
                              <p className="text-gray-600">{setting.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
