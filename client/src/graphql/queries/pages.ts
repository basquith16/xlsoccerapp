import { gql } from '@apollo/client';

// Get all pages (admin only)
export const GET_PAGES = gql`
  query GetPages($limit: Int, $offset: Int, $status: String, $search: String) {
    pages(limit: $limit, offset: $offset, status: $status, search: $search) {
      nodes {
        id
        title
        slug
        navigation {
          showInNavigation
          navigationTitle
          menuOrder
          parentSlug
        }
        status
        publishedAt
        createdAt
        updatedAt
        createdBy
        updatedBy
      }
      totalCount
      hasNextPage
    }
  }
`;

// Get single page (admin only)
export const GET_PAGE = gql`
  query GetPage($id: ID!) {
    page(id: $id) {
      id
      title
      slug
      meta {
        title
        description
        keywords
        ogImage
      }
      settings {
        layout
        theme
        customCSS
      }
      navigation {
        showInNavigation
        navigationTitle
        menuOrder
        parentSlug
      }
      blocks {
        id
        type
        props
        position {
          row
          col
          span
        }
        visibility {
          desktop
          tablet
          mobile
        }
      }
      status
      publishedAt
      scheduledAt
      createdAt
      updatedAt
      createdBy
      updatedBy
    }
  }
`;

// Get published page by slug (public)
export const GET_PAGE_BY_SLUG = gql`
  query GetPageBySlug($slug: String!) {
    pageBySlug(slug: $slug) {
      id
      title
      slug
      meta {
        title
        description
        keywords
        ogImage
      }
      settings {
        layout
        theme
        customCSS
      }
      blocks {
        id
        type
        props
        position {
          row
          col
          span
        }
        visibility {
          desktop
          tablet
          mobile
        }
      }
      publishedAt
    }
  }
`;

// Get navigation pages (public)
export const GET_NAVIGATION_PAGES = gql`
  query GetNavigationPages {
    navigationPages {
      id
      title
      slug
      navigation {
        showInNavigation
        navigationTitle
        menuOrder
        parentSlug
      }
    }
  }
`;