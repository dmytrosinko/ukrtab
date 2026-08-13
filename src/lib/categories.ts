import { Category } from './types';
import { INITIAL_CATEGORIES } from './store';

export interface CategoryNode extends Category {
  children?: CategoryNode[];
}

export function getCategoryTree(categories: Category[] = INITIAL_CATEGORIES): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [] });
  });

  categories.forEach((cat) => {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      const parent = map.get(cat.parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
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
  });

  return options;
}
