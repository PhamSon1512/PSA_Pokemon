import { drizzle } from 'drizzle-orm/d1';
import * as schema from '~/models';

console.log('schema:', schema);
const mockDb = {} as any;
const db = drizzle(mockDb, { schema: { ...schema } });
console.log('db.query keys:', db.query ? Object.keys(db.query) : 'undefined');
