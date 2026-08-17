import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Онлайн-конструктор магнітів, наліпок на авто та табличок | Укртаб',
  description: 'Створіть свій власний макет магніту на авто, автономера або таблички в онлайн-конструкторі Укртаб. Додавайте фото, позивні, емблеми, текст та замовляйте виготовлення за 1-2 дні.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua'}/constructor`,
  },
};

export default function ConstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
