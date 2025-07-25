import { gql } from '@apollo/client';

// Create new page
export const CREATE_PAGE = gql`
  mutation CreatePage($input: CreatePageInput!) {
    createPage(input: $input) {
      id
      title
      slug
      status
      createdAt
      updatedAt
    }
  }
`;

// Update page
export const UPDATE_PAGE = gql`
  mutation UpdatePage($id: ID!, $input: UpdatePageInput!) {
    updatePage(id: $id, input: $input) {
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
      updatedAt
    }
  }
`;

// Update page blocks only (for real-time editing)
export const UPDATE_PAGE_BLOCKS = gql`
  mutation UpdatePageBlocks($id: ID!, $input: UpdatePageBlocksInput!) {
    updatePageBlocks(id: $id, input: $input) {
      id
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
      updatedAt
    }
  }
`;

// Publish page
export const PUBLISH_PAGE = gql`
  mutation PublishPage($id: ID!) {
    publishPage(id: $id) {
      id
      status
      publishedAt
    }
  }
`;

// Unpublish page
export const UNPUBLISH_PAGE = gql`
  mutation UnpublishPage($id: ID!) {
    unpublishPage(id: $id) {
      id
      status
      publishedAt
    }
  }
`;

// Delete page
export const DELETE_PAGE = gql`
  mutation DeletePage($id: ID!) {
    deletePage(id: $id)
  }
`;

// Duplicate page
export const DUPLICATE_PAGE = gql`
  mutation DuplicatePage($id: ID!, $title: String!) {
    duplicatePage(id: $id, title: $title) {
      id
      title
      slug
      status
      createdAt
    }
  }
`;