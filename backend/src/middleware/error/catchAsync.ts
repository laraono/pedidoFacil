import { Response, NextFunction } from 'express';

export const catchAsync = (fn: Function) => {
    return (req, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next); 
    };
};