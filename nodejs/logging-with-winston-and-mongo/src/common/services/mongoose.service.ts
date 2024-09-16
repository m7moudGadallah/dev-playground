import { ConfigService } from './config.service';
import mongoose from 'mongoose';

export class MongooseService {
  connect(config: ConfigService): Promise<mongoose.Mongoose> {
    return mongoose.connect(config.get('MONGO_APP_DB_URL'));
  }

  disconnect(): Promise<void> {
    return mongoose.disconnect();
  }
}
