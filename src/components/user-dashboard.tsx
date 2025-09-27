"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, HelpCircle, Building2, LogOut } from "lucide-react"
import Link from "next/link"
import { ClockWidget } from "./clock-widget"

export function UserDashboard() {
  const menuItems = [
    { name: "勤怠管理", href: "/user/attendance", icon: Clock },
    { name: "希望休管理", href: "/user/holidays", icon: Calendar },
  ]

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <Building2 className="h-6 w-6" />
            <div className="flex flex-col">
              <span className="font-semibold">みつまるケア</span>
              <span className="text-xs text-muted-foreground">一般職画面</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>メニュー</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild>
                        <Link href={item.href}>
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>その他</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/faq">
                      <HelpCircle className="h-4 w-4" />
                      <span>FAQ</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/">
                      <LogOut className="h-4 w-4" />
                      <span>ログアウト</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-xl font-semibold text-gray-900">ダッシュボード</h1>
        </header>

        <main className="flex-1 p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">一般職ダッシュボード</h2>
            <p className="text-gray-600">お疲れ様です！今日も一日頑張りましょう</p>
          </div>

          <div className="mb-6">
            <ClockWidget />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  勤怠管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">打刻申請・追加訂正申請ができます</p>
                <Link href="/user/attendance">
                  <Button className="w-full">勤怠ページへ</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  希望休管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">希望休の入力・確認ができます</p>
                <Link href="/user/holidays">
                  <Button className="w-full">希望休入力ページへ</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>今月のシフト</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">今月のシフト予定を確認できます（実装予定）</p>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
