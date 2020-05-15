import { Request } from 'express';

export interface CustomRequest extends Request {
    headers: any;
    uid?: string;
    jwt?: any;
}
