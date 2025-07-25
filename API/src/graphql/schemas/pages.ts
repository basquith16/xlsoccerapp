import { gql } from 'graphql-tag';

export const pageSchema = gql`
  # Block types for page builder
  type Block {
    id: String!
    type: String!
    props: JSON
    position: BlockPosition!
    visibility: BlockVisibility
  }

  type BlockPosition {
    row: Int!
    col: Int!
    span: Int
  }

  type BlockVisibility {
    desktop: Boolean
    tablet: Boolean
    mobile: Boolean
  }

  # Page meta information
  type PageMeta {
    title: String
    description: String
    keywords: [String!]
    ogImage: String
  }

  # Page settings
  type PageSettings {
    layout: String
    theme: String
    customCSS: String
  }

  # Page navigation settings
  type PageNavigation {
    showInNavigation: Boolean!
    navigationTitle: String
    menuOrder: Int!
    parentSlug: String
  }

  # Main Page type
  type Page {
    id: ID!
    title: String!
    slug: String!
    meta: PageMeta!
    settings: PageSettings!
    navigation: PageNavigation!
    blocks: [Block!]!
    status: String!
    publishedAt: Date
    scheduledAt: Date
    createdBy: ID!
    updatedBy: ID!
    createdAt: Date!
    updatedAt: Date!
  }

  # Connection type for pagination
  type PageConnection {
    nodes: [Page!]!
    totalCount: Int!
    hasNextPage: Boolean!
  }

  # Input types for mutations
  input BlockInput {
    id: String!
    type: String!
    props: JSON
    position: BlockPositionInput!
    visibility: BlockVisibilityInput
  }

  input BlockPositionInput {
    row: Int!
    col: Int!
    span: Int
  }

  input BlockVisibilityInput {
    desktop: Boolean
    tablet: Boolean
    mobile: Boolean
  }

  input PageMetaInput {
    title: String
    description: String
    keywords: [String!]
    ogImage: String
  }

  input PageSettingsInput {
    layout: String
    theme: String
    customCSS: String
  }

  input PageNavigationInput {
    showInNavigation: Boolean
    navigationTitle: String
    menuOrder: Int
    parentSlug: String
  }

  input CreatePageInput {
    title: String!
    slug: String
    meta: PageMetaInput
    settings: PageSettingsInput
    navigation: PageNavigationInput
    blocks: [BlockInput!]
    status: String
  }

  input UpdatePageInput {
    title: String
    slug: String
    meta: PageMetaInput
    settings: PageSettingsInput
    navigation: PageNavigationInput
    blocks: [BlockInput!]
    status: String
  }

  input UpdatePageBlocksInput {
    blocks: [BlockInput!]!
  }

  # Extend the root Query type to add page-related queries
  extend type Query {
    # Get all pages (admin only)
    pages(
      limit: Int
      offset: Int
      status: String
      search: String
    ): PageConnection!
    
    # Get single page by ID (admin only)
    page(id: ID!): Page
    
    # Get published page by slug (public)
    pageBySlug(slug: String!): Page
    
    # Get published pages (public)
    publishedPages(limit: Int, offset: Int): PageConnection!
    
    # Get navigation pages (public) - only pages marked for navigation
    navigationPages: [Page!]!
  }

  # Extend the root Mutation type to add page-related mutations
  extend type Mutation {
    # Create new page (admin only)
    createPage(input: CreatePageInput!): Page!
    
    # Update page (admin only)
    updatePage(id: ID!, input: UpdatePageInput!): Page!
    
    # Update page blocks only (admin only) - for real-time editing
    updatePageBlocks(id: ID!, input: UpdatePageBlocksInput!): Page!
    
    # Publish page (admin only)
    publishPage(id: ID!): Page!
    
    # Unpublish page (admin only)
    unpublishPage(id: ID!): Page!
    
    # Delete page (admin only)
    deletePage(id: ID!): String!
    
    # Duplicate page (admin only)
    duplicatePage(id: ID!, title: String!): Page!
  }
`;