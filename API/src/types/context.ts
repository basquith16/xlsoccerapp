import { IUser } from './models';
import { IncomingMessage, ServerResponse } from 'http';

export interface DataLoaders {
  userLoader: any;
  playerLoader: any;
  sessionLoader: any;
  trainersBySessionLoader: any;
  playersByParentLoader: any;
}

export interface AuthContext {
  user: IUser | null;
  req: IncomingMessage;
  res: ServerResponse;
  loaders: DataLoaders;
}

export interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
} 