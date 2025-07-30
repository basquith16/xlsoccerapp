import SessionTemplate from '../../models/sessionTemplateModel';
import { validateObjectId } from '../../utils/validation';
// Helper function to convert Mongoose documents to plain objects with string IDs
const convertToPlainObject = (doc) => {
    if (!doc)
        return doc;
    const plain = doc.toObject ? doc.toObject() : doc;
    // Convert ObjectIds to strings
    if (plain._id) {
        plain.id = plain._id.toString();
        delete plain._id;
    }
    return plain;
};
const convertArrayToPlainObjects = (docs) => {
    return docs.map(convertToPlainObject);
};
export const templateResolvers = {
    Query: {
        sessionTemplates: async (_, { limit = 10, offset = 0 }) => {
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
        sessionTemplate: async (_, { id }) => {
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
        sessionTemplateBySlug: async (_, { slug }) => {
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
        adminSessionTemplates: async (_, { limit = 10, offset = 0 }, { user }) => {
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
            }
            catch (error) {
                console.error('Error fetching admin session templates:', error);
                throw new Error('Failed to fetch session templates');
            }
        }
    },
    Mutation: {
        createSessionTemplate: async (_, { input }, { user }) => {
            if (!user || user.role !== 'admin') {
                throw new Error('Not authorized - Admin access required');
            }
            try {
                const template = new SessionTemplate(input);
                const savedTemplate = await template.save();
                console.log(`Admin ${user.email} created session template: ${savedTemplate.name} (ID: ${savedTemplate._id})`);
                return convertToPlainObject(savedTemplate);
            }
            catch (error) {
                console.error('Error creating session template:', error);
                throw new Error(error.message || 'Failed to create session template');
            }
        },
        updateSessionTemplate: async (_, { id, input }, { user }) => {
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
            }
            catch (error) {
                console.error('Error updating session template:', error);
                throw new Error(error.message || 'Failed to update session template');
            }
        },
        deleteSessionTemplate: async (_, { id }, { user }) => {
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
            }
            catch (error) {
                console.error('Error deleting session template:', error);
                throw new Error(error.message || 'Failed to delete session template');
            }
        }
    }
};
