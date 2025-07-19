import { Request } from 'express';
export interface Context {
    user?: {
        id: string;
        email: string;
        role: string;
        iat: number;
        exp: number;
    } | null;
    req: Request;
}
//# sourceMappingURL=context.d.ts.map