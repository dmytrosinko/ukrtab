import { Category } from './types';
import { INITIAL_CATEGORIES } from './store';

export interface CategoryNode extends Category {
  children?: CategoryNode[];
  count?: number;
}

export function getCategoryTree(categories: Category[] = INITIAL_CATEGORIES): CategoryNode[] {
  // Use canonical structure from INITIAL_CATEGORIES as the master hierarchy
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  INITIAL_CATEGORIES.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [] });
  });

  INITIAL_CATEGORIES.forEach((cat) => {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      const parent = map.get(cat.parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Always ensure "Інше" (inshe / cat-other) is placed at the very end
  roots.sort((a, b) => {
    if (a.slug === 'inshe' || a.id === 'cat-other') return 1;
    if (b.slug === 'inshe' || b.id === 'cat-other') return -1;
    return 0;
  });

  return roots;
}

export function getCategoryOptions(categories: Category[] = INITIAL_CATEGORIES): { id: string; name: string; isSub: boolean; parentId?: string | null }[] {
  const tree = getCategoryTree(categories);
  const options: { id: string; name: string; isSub: boolean; parentId?: string | null }[] = [];

  tree.forEach((mainCat) => {
    options.push({ id: mainCat.id, name: mainCat.name, isSub: false, parentId: null });
    if (mainCat.children && mainCat.children.length > 0) {
      mainCat.children.forEach((subCat) => {
        options.push({ id: subCat.id, name: `— ${subCat.name}`, isSub: true, parentId: mainCat.id });
      });
    }
  return options;
}

export function getCategoryIcon(slug: string): string {
  switch (slug) {
    case 'magniti-na-avto':
      return '🚗';
    case 'suvenirni-avtonomera':
      return '🚙';
    case 'adresni-tablichki':
      return '🏠';
    case 'tablichki-dlya-biznesu':
      return '🚪';
    case 'informatsijni-tablichki':
      return '📋';
    case 'ritualni-tablichki':
      return '🪦';
    case 'trafareti':
      return '🎨';
    case 'uf-druk':
      return '🖨️';
    case 'inshe':
      return '📦';
    default:
      return '🏷️';
  }
}
