import { PrismaClient } from '@prisma/client';

export class PostgresDB {
  private prismaClient: PrismaClient;
  private static instance: PostgresDB;

  private constructor() {
    this.prismaClient = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'], // Enable query logging
    });
  }

  static getInstance(): PostgresDB {
    if (!PostgresDB.instance) {
      PostgresDB.instance = new PostgresDB();
    }

    return PostgresDB.instance;
  }

  get prisma(): PrismaClient {
    return this.prismaClient;
  }

  connect(): Promise<void> {
    return this.prismaClient.$connect();
  }

  disconnect(): Promise<void> {
    return this.prismaClient.$disconnect();
  }
}
