// Input validation helpers
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
export const validatePassword = (password) => {
    return password.length >= 8;
};
export const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
};
export const validateObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};
export const validateRequiredFields = (input, requiredFields) => {
    const missing = requiredFields.filter(field => !input[field]);
    return missing;
};
