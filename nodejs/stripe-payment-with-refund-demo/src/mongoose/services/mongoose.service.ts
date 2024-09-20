import { ConfigService } from '../../config/services';
import mongoose from 'mongoose';

export class MongooseService {
  constructor(private readonly config: ConfigService) {}

  async connect(): Promise<void> {
    await mongoose.connect(this.config.get('MONGO_URI'));
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }
}
