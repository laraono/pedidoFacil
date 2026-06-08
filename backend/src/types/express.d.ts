import { UserStatus } from '../enum';

declare global {
    namespace Express {
        interface Request {
            usuario?: {
                id: number, 
                nome: string, 
                email: string, 
                status: UserStatus,
                estabelecimento: number
            }; 
        }
    }
}

export {};