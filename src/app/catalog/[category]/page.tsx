import { redirect } from 'next/navigation';

export default async function CategoryPage({
  params,
}: {
  params?: Promise<{ category: string }>;
}) {
  let categoryName = '';
  try {
    const resolved = params ? await params : { category: '' };
    categoryName = resolved.category || '';
  } catch (e) {
    categoryName = '';
  }

  if (categoryName) {
    redirect(`/catalog?category=${encodeURIComponent(categoryName)}`);
  }

  redirect('/catalog');
}
