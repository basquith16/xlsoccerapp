// Navigation utility for generating automatic navigation from pages
export interface NavigationItem {
  id: string;
  title: string;
  slug: string;
  url: string;
  menuOrder: number;
  children?: NavigationItem[];
}

export interface PageNavigationData {
  id: string;
  title: string;
  slug: string;
  navigation: {
    showInNavigation: boolean;
    navigationTitle?: string;
    menuOrder: number;
    parentSlug?: string;
  };
}

/**
 * Generates hierarchical navigation structure from page data
 * Pages with slug format 'parent/child' are automatically grouped under parent menus
 */
export function generateNavigation(pages: PageNavigationData[]): NavigationItem[] {
  // Filter only pages that should show in navigation
  const navPages = pages.filter(page => page.navigation.showInNavigation);
  
  // Create navigation items
  const navItems: NavigationItem[] = navPages.map(page => ({
    id: page.id,
    title: page.navigation.navigationTitle || page.title,
    slug: page.slug,
    url: `/${page.slug}`,
    menuOrder: page.navigation.menuOrder,
    children: []
  }));
  
  // Separate main menu items and sub-menu items
  const mainItems: NavigationItem[] = [];
  const subItems: NavigationItem[] = [];
  
  navItems.forEach(item => {
    if (item.slug.includes('/')) {
      // This is a sub-page (contains slash)
      subItems.push(item);
    } else {
      // This is a main page
      mainItems.push(item);
    }
  });
  
  // Group sub-items under their parent pages
  subItems.forEach(subItem => {
    const parentSlug = subItem.slug.split('/')[0];
    const parentItem = mainItems.find(item => item.slug === parentSlug);
    
    if (parentItem) {
      // Add to existing parent
      if (!parentItem.children) {
        parentItem.children = [];
      }
      parentItem.children.push(subItem);
    } else {
      // Create virtual parent if it doesn't exist as a page
      const virtualParent: NavigationItem = {
        id: `virtual-${parentSlug}`,
        title: formatSlugAsTitle(parentSlug),
        slug: parentSlug,
        url: `/${parentSlug}`,
        menuOrder: 999, // Default to end unless explicitly set
        children: [subItem]
      };
      mainItems.push(virtualParent);
    }
  });
  
  // Sort main items by menuOrder
  mainItems.sort((a, b) => a.menuOrder - b.menuOrder);
  
  // Sort children within each parent by menuOrder
  mainItems.forEach(item => {
    if (item.children && item.children.length > 0) {
      item.children.sort((a, b) => a.menuOrder - b.menuOrder);
    }
  });
  
  return mainItems;
}

/**
 * Formats a slug as a readable title
 * Example: 'about-us' becomes 'About Us'
 */
function formatSlugAsTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Flattens navigation items for mobile menu or simple list rendering
 */
export function flattenNavigation(navItems: NavigationItem[]): NavigationItem[] {
  const flattened: NavigationItem[] = [];
  
  navItems.forEach(item => {
    flattened.push(item);
    if (item.children && item.children.length > 0) {
      flattened.push(...item.children);
    }
  });
  
  return flattened;
}

/**
 * Finds a navigation item by slug
 */
export function findNavigationItem(navItems: NavigationItem[], slug: string): NavigationItem | null {
  for (const item of navItems) {
    if (item.slug === slug) {
      return item;
    }
    if (item.children) {
      const childItem = findNavigationItem(item.children, slug);
      if (childItem) {
        return childItem;
      }
    }
  }
  return null;
}