import { Product } from './types';

export function searchProducts(products: Product[], rawQuery: string): Product[] {
  if (!rawQuery || !rawQuery.trim()) return products;

  const query = rawQuery.trim().toLowerCase();

  // 1. Direct exact substring match
  const exactMatches = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query))
  );

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  // 2. Tokenized word & stem matching
  const stopWords = new Set(['на', 'з', 'в', 'для', 'та', 'і', 'i', 'и', 'по', 'під', 'до', 'от', 'с']);
  const words = query
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9а-яіїєґ]/gi, '').toLowerCase())
    .filter((w) => w.length >= 2 && !stopWords.has(w));

  if (words.length === 0) return exactMatches;

  const scored = products
    .map((p) => {
      const nameLower = p.name.toLowerCase();
      const descLower = (p.description || '').toLowerCase();
      const skuLower = (p.sku || '').toLowerCase();

      let score = 0;
      let matchedWords = 0;

      for (const w of words) {
        // Prepare stem for Ukrainian/Russian suffix variation (e.g. бригадний/бригада/бригадный, магнітний/магніт)
        const stem = w.length > 4 ? w.slice(0, Math.max(3, w.length - 2)) : w;

        if (nameLower.includes(w)) {
          score += 15;
          matchedWords++;
        } else if (nameLower.includes(stem)) {
          score += 10;
          matchedWords++;
        } else if (descLower.includes(w) || descLower.includes(stem)) {
          score += 5;
          matchedWords++;
        } else if (skuLower.includes(w)) {
          score += 12;
          matchedWords++;
        }
      }

      return { product: p, score, matchedWords };
    })
    .filter((item) => item.matchedWords > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((item) => item.product);
}
