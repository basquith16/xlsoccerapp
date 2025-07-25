import Page from '../../models/pageModel';
import { IUser } from '../../types/models';
import { validateObjectId } from '../../utils/validation';

export const pageResolvers = {
  Query: {
    // Get all pages (admin only)
    pages: async (_: unknown, args: any, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const { limit = 20, offset = 0, status, search } = args;
        
        // Build query
        const query: any = {};
        if (status) query.status = status;
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } }
          ];
        }

        // Execute query with pagination
        const [pages, totalCount] = await Promise.all([
          Page.find(query)
            .sort({ updatedAt: -1 })
            .skip(offset)
            .limit(limit),
          Page.countDocuments(query)
        ]);

        return {
          nodes: pages,
          totalCount,
          hasNextPage: offset + limit < totalCount
        };
      } catch (error) {
        console.error('Error fetching pages:', error);
        throw new Error('Failed to fetch pages');
      }
    },

    // Get single page by ID (admin only)
    page: async (_: unknown, { id }: { id: string }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid page ID');
      }

      try {
        const page = await Page.findById(id);
        
        if (!page) {
          throw new Error('Page not found');
        }

        return page;
      } catch (error) {
        console.error('Error fetching page:', error);
        throw new Error('Failed to fetch page');
      }
    },

    // Get published page by slug (public)
    pageBySlug: async (_: unknown, { slug }: { slug: string }) => {
      try {
        const page = await Page.findOne({ 
          slug: slug.toLowerCase(), 
          status: 'published' 
        });
        
        if (!page) {
          throw new Error('Page not found');
        }

        return page;
      } catch (error) {
        console.error('Error fetching page by slug:', error);
        throw new Error('Failed to fetch page');
      }
    },

    // Get published pages (public)
    publishedPages: async (_: unknown, args: any) => {
      try {
        const { limit = 20, offset = 0 } = args;
        
        const [pages, totalCount] = await Promise.all([
          Page.find({ status: 'published' })
            .sort({ publishedAt: -1 })
            .skip(offset)
            .limit(limit),
          Page.countDocuments({ status: 'published' })
        ]);

        return {
          nodes: pages,
          totalCount,
          hasNextPage: offset + limit < totalCount
        };
      } catch (error) {
        console.error('Error fetching published pages:', error);
        throw new Error('Failed to fetch published pages');
      }
    },

    // Get navigation pages (public)
    navigationPages: async () => {
      try {
        const pages = await Page.find({
          status: 'published',
          'navigation.showInNavigation': true
        })
        .sort({ 'navigation.menuOrder': 1, updatedAt: -1 })
        .select('title slug navigation');

        return pages;
      } catch (error) {
        console.error('Error fetching navigation pages:', error);
        throw new Error('Failed to fetch navigation pages');
      }
    }
  },

  Mutation: {
    // Create new page (admin only)
    createPage: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      try {
        const pageData = {
          ...input,
          slug: input.slug || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          createdBy: user._id,
          updatedBy: user._id,
          blocks: input.blocks || [],
          meta: input.meta || {},
          settings: input.settings || {}
        };

        const page = new Page(pageData);
        await page.save();

        console.log(`📄 Created page: ${page.title} (${page.slug})`);
        return page;
      } catch (error: any) {
        console.error('Error creating page:', error);
        if (error.code === 11000) {
          throw new Error('A page with this slug already exists');
        }
        throw new Error('Failed to create page');
      }
    },

    // Update page (admin only)
    updatePage: async (_: unknown, { id, input }: { id: string; input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid page ID');
      }

      try {
        const page = await Page.findByIdAndUpdate(
          id,
          { 
            ...input, 
            updatedBy: user._id 
          },
          { new: true, runValidators: true }
        );

        if (!page) {
          throw new Error('Page not found');
        }

        console.log(`📄 Updated page: ${page.title} (${page.slug})`);
        return page;
      } catch (error: any) {
        console.error('Error updating page:', error);
        if (error.code === 11000) {
          throw new Error('A page with this slug already exists');
        }
        throw new Error('Failed to update page');
      }
    },

    // Update page blocks only (admin only) - for real-time editing
    updatePageBlocks: async (_: unknown, { id, input }: { id: string; input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid page ID');
      }

      try {
        const page = await Page.findByIdAndUpdate(
          id,
          { 
            blocks: input.blocks,
            updatedBy: user._id 
          },
          { new: true, runValidators: true }
        );

        if (!page) {
          throw new Error('Page not found');
        }

        return page;
      } catch (error) {
        console.error('Error updating page blocks:', error);
        throw new Error('Failed to update page blocks');
      }
    },

    // Publish page (admin only)
    publishPage: async (_: unknown, { id }: { id: string }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid page ID');
      }

      try {
        const page = await Page.findByIdAndUpdate(
          id,
          { 
            status: 'published',
            publishedAt: new Date(),
            updatedBy: user._id 
          },
          { new: true }
        );

        if (!page) {
          throw new Error('Page not found');
        }

        console.log(`📄 Published page: ${page.title} (${page.slug})`);
        return page;
      } catch (error) {
        console.error('Error publishing page:', error);
        throw new Error('Failed to publish page');
      }
    },

    // Unpublish page (admin only)
    unpublishPage: async (_: unknown, { id }: { id: string }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid page ID');
      }

      try {
        const page = await Page.findByIdAndUpdate(
          id,
          { 
            status: 'draft',
            publishedAt: null,
            updatedBy: user._id 
          },
          { new: true }
        );

        if (!page) {
          throw new Error('Page not found');
        }

        console.log(`📄 Unpublished page: ${page.title} (${page.slug})`);
        return page;
      } catch (error) {
        console.error('Error unpublishing page:', error);
        throw new Error('Failed to unpublish page');
      }
    },

    // Delete page (admin only)
    deletePage: async (_: unknown, { id }: { id: string }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid page ID');
      }

      try {
        const page = await Page.findByIdAndDelete(id);
        
        if (!page) {
          throw new Error('Page not found');
        }

        console.log(`📄 Deleted page: ${page.title} (${page.slug})`);
        return 'Page deleted successfully';
      } catch (error) {
        console.error('Error deleting page:', error);
        throw new Error('Failed to delete page');
      }
    },

    // Duplicate page (admin only)
    duplicatePage: async (_: unknown, { id, title }: { id: string; title: string }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid page ID');
      }

      try {
        const originalPage = await Page.findById(id);
        
        if (!originalPage) {
          throw new Error('Page not found');
        }

        const duplicatedPage = new Page({
          title,
          slug: '', // Will be auto-generated from title
          meta: originalPage.meta,
          settings: originalPage.settings,
          blocks: originalPage.blocks,
          status: 'draft',
          createdBy: user._id,
          updatedBy: user._id
        });

        await duplicatedPage.save();

        console.log(`📄 Duplicated page: ${duplicatedPage.title} (${duplicatedPage.slug})`);
        return duplicatedPage;
      } catch (error: any) {
        console.error('Error duplicating page:', error);
        if (error.code === 11000) {
          throw new Error('A page with this title already exists');
        }
        throw new Error('Failed to duplicate page');
      }
    }
  }
};