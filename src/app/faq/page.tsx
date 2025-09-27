import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FAQPage() {
  const faqs = [
    {
      question: "パスワードを忘れた場合はどうすればよいですか？",
      answer: "管理者にお問い合わせください。新しいパスワードを発行いたします。",
    },
    {
      question: "シフトの変更はいつまで可能ですか？",
      answer: "原則として、シフト確定の3日前まで変更可能です。緊急時は管理者にご相談ください。",
    },
    {
      question: "希望休はいつまでに提出すればよいですか？",
      answer: "翌月の希望休は、毎月20日までに提出してください。",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">FAQ・お問い合わせ</h1>
            <Link href="/">
              <Button variant="outline" size="sm">
                トップに戻る
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">よくある質問</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">Q. {faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">A. {faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>お問い合わせ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">その他ご不明な点がございましたら、以下までお問い合わせください。</p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>電話:</strong> 0120-XXX-XXX
              </p>
              <p>
                <strong>メール:</strong> support@mitsumaru-care.com
              </p>
              <p>
                <strong>受付時間:</strong> 平日 9:00-18:00
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
