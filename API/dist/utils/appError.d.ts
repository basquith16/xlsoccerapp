export default AppError;
declare class AppError extends Error {
    constructor(message: any, statusCode: any);
    statusCode: any;
    status: string;
    isOperational: boolean;
}
//# sourceMappingURL=appError.d.ts.map