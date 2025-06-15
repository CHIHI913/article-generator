import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          記事生成アプリ
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          AI を活用して高品質な記事を簡単に生成できます
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/article"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            記事を生成する
          </Link>
          <Link
            href="/admin/formats"
            className="bg-gray-600 text-white px-8 py-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            フォーマット管理
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">簡単操作</h3>
            <p className="text-gray-600 text-sm">
              概要を入力するだけで、AI が自動的に記事を生成します
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">多彩なフォーマット</h3>
            <p className="text-gray-600 text-sm">
              ブログ、ニュース、SEO記事など、目的に応じたフォーマットを選択可能
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">リアルタイム生成</h3>
            <p className="text-gray-600 text-sm">
              ストリーミング機能により、生成過程をリアルタイムで確認
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
