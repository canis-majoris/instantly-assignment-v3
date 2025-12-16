// Init database in memory for node tests
import { db } from './src/lib/database';
import { emails } from './src/lib/schema';

afterAll(async () => {
  await db.delete(emails);
});
