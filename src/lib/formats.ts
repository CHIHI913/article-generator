export type Format = {
  id: string;
  name: string;
  template: string;
};

export const defaultFormats: Format[] = [
  {
    id: 'blog',
    name: 'ブログ',
    template: `# ブログ記事テンプレート\n\n## タイトル\n{{title}}\n\n## リード文\n{{lead}}\n\n## 見出し1\n{{heading1}}\n\n本文\n\n## 見出し2\n{{heading2}}\n\n本文\n\n## まとめ\n{{conclusion}}`,
  },
  {
    id: 'news',
    name: 'ニュース',
    template: `# ニューステンプレート\n\n## 見出し\n{{headline}}\n\n### 日時・場所\n{{datetime_place}}\n\n### 本文\n{{body}}\n\n### 背景\n{{background}}\n\n### 今後の見通し\n{{outlook}}`,
  },
  {
    id: 'seo',
    name: 'SEO ランディング',
    template: `# SEO ランディングページテンプレート\n\n## タイトル (キーワード含む)\n{{title}}\n\n## リード文\n{{lead}}\n\n## 課題提起\n{{problem}}\n\n## 解決策\n{{solution}}\n\n## 具体例\n{{examples}}\n\n## CTA\n{{cta}}`,
  },
];
