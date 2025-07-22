import SessionTemplate from '../../models/sessionTemplateModel';
import { validateObjectId } from '../../utils/validation';
import { IUser } from '../../types/models';

// Helper function to convert Mongoose documents to plain objects with string IDs
const convertToPlainObject = (doc: any) => {
  if (!doc) return doc;
  const plain = doc.toObject ? doc.toObject() : doc;
  
  // Convert ObjectIds to strings
  if (plain._id) {
    plain.id = plain._id.toString();
    delete plain._id;
  }
  
  return plain;
};

const convertArrayToPlainObjects = (docs: any[]) => {
  return docs.map(convertToPlainObject);
};

export const templateResolvers = {
  Query: {
    sessionTemplates: async (_: unknown, { limit = 10, offset = 0 }: { limit?: number; offset?: number }) => {
      const templates = await SessionTemplate.find({ isActive: true })
        .populate('periods')
        .populate('instances')
        .limit(limit)
        .skip(offset);
      
      const totalCount = await SessionTemplate.countDocuments({ isActive: true });
      const hasNextPage = offset + limit < totalCount;
      
      return {
        nodes: convertArrayToPlainObjects(templates),
        totalCount,
        hasNextPage
      };
    },
    
    sessionTemplate: async (_: unknown, { id }: { id: string }) => {
      if (!validateObjectId(id)) {
        throw new Error('Invalid session template ID format');
      }
      const template = await SessionTemplate.findById(id)
        .populate('periods')
        .populate('instances');
      if (!template) {
        throw new Error('Session template not found');
      }
      return convertToPlainObject(template);
    },
    
    sessionTemplateBySlug: async (_: unknown, { slug }: { slug: string }) => {
      if (!slug) {
        throw new Error('Slug is required');
      }
      const template = await SessionTemplate.findOne({ slug, isActive: true })
        .populate('periods')
        .populate('instances');
      if (!template) {
        throw new Error('Session template not found');
      }
      return convertToPlainObject(template);
    },

    adminSessionTemplates: async (_: unknown, { limit = 10, offset = 0 }: { limit?: number; offset?: number }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      try {
        const totalCount = await SessionTemplate.countDocuments();
        const templates = await SessionTemplate.find()
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit);

        return {
          nodes: convertArrayToPlainObjects(templates),
          totalCount,
          hasNextPage: offset + limit < totalCount,
          hasPreviousPage: offset > 0
        };
      } catch (error: any) {
        console.error('Error fetching admin session templates:', error);
        throw new Error('Failed to fetch session templates');
      }
    }
  },

  Mutation: {
    createSessionTemplate: async (_: unknown, { input }: { input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      try {
        const template = new SessionTemplate(input);
        const savedTemplate = await template.save();
        console.log(`Admin ${user.email} created session template: ${savedTemplate.name} (ID: ${savedTemplate._id})`);
        return convertToPlainObject(savedTemplate);
      } catch (error: any) {
        console.error('Error creating session template:', error);
        throw new Error(error.message || 'Failed to create session template');
      }
    },

    updateSessionTemplate: async (_: unknown, { id, input }: { id: string; input: any }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid session template ID format');
      }

      try {
        const template = await SessionTemplate.findByIdAndUpdate(id, input, { new: true });
        if (!template) {
          throw new Error('Session template not found');
        }
        console.log(`Admin ${user.email} updated session template: ${template.name} (ID: ${template._id})`);
        return convertToPlainObject(template);
      } catch (error: any) {
        console.error('Error updating session template:', error);
        throw new Error(error.message || 'Failed to update session template');
      }
    },

    deleteSessionTemplate: async (_: unknown, { id }: { id: string }, { user }: { user: IUser | null }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      if (!validateObjectId(id)) {
        throw new Error('Invalid session template ID format');
      }

      try {
        const template = await SessionTemplate.findByIdAndDelete(id);
        if (!template) {
          throw new Error('Session template not found');
        }
        console.log(`Admin ${user.email} deleted session template: ${template.name} (ID: ${template._id})`);
        return 'Session template deleted successfully';
      } catch (error: any) {
        console.error('Error deleting session template:', error);
        throw new Error(error.message || 'Failed to delete session template');
      }
    }
  }
}; 