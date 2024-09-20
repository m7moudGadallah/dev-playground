import mongoose from 'mongoose';
import { ConfigService } from '../src/config/services';
import { MongooseService } from '../src/mongoose/services';
import path from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
import { BookModel } from '../src/books/interfaces';
import { bookModel, customerModel } from '../src/dependency-registry';
import { CustomerModel } from '../src/customers/interfaces';

class SeederService {
  private genFullFilePath(fileName: string): string {
    return path.join(__dirname, 'data', fileName);
  }

  private async seedFactory(
    model: mongoose.Model<any>,
    fileName: string,
    messageToken: string,
  ) {
    const filePath = this.genFullFilePath(fileName);
    const data: any[] = JSON.parse(
      await promisify(readFile)(filePath, 'utf-8'),
    );

    if ((await model.countDocuments()) >= data.length) {
      console.log(`${messageToken} is already seeded before`);
    } else {
      await model.insertMany(data);
      console.log(`${messageToken} seeded successfully`);
    }
  }

  private seedBooks(bookModel: BookModel): Promise<void> {
    return this.seedFactory(bookModel, 'books.json', 'books');
  }

  private seedCustomers(customerModel: CustomerModel): Promise<void> {
    return this.seedFactory(customerModel, 'customers.json', 'customers');
  }

  async seed(models: {
    bookModel: BookModel;
    customerModel: CustomerModel;
  }): Promise<void> {
    await this.seedBooks(models.bookModel);
    await this.seedCustomers(models.customerModel);
  }
}

async function main(): Promise<void> {
  const mongooseService = new MongooseService(new ConfigService());
  const seeder = new SeederService();

  await mongooseService.connect();
  console.log('MongoDB connected');

  await seeder.seed({
    bookModel,
    customerModel,
  });

  await mongooseService.disconnect();
  console.log('MongoDB disconnected');
}

main()
  .then(() => {
    console.log(`Data seeded successfully🌱`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`Failed to seed data: `, error.message);
    process.exit(1);
  });
