interface ArticleOutputProps {
  content: string;
}

export function ArticleOutput({ content }: ArticleOutputProps) {
  return (
    <section className="border p-4 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded">
      {content}
    </section>
  );
}