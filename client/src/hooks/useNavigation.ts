import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_NAVIGATION_PAGES } from '../graphql/queries/pages';
import { generateNavigation, NavigationItem, PageNavigationData } from '../utils/navigation';

/**
 * Custom hook for managing site navigation
 * Fetches navigation pages and generates hierarchical navigation structure
 */
export function useNavigation() {
  // Fetch navigation pages from GraphQL
  const { data, loading, error } = useQuery(GET_NAVIGATION_PAGES, {
    fetchPolicy: 'cache-first', // Use cache for performance
    errorPolicy: 'all' // Continue with partial data if there are errors
  });

  // Generate navigation structure from page data
  const navigationItems = useMemo((): NavigationItem[] => {
    if (!data?.navigationPages) {
      return [];
    }

    const pages: PageNavigationData[] = data.navigationPages;
    return generateNavigation(pages);
  }, [data?.navigationPages]);

  return {
    navigationItems,
    loading,
    error,
    hasNavigation: navigationItems.length > 0
  };
}