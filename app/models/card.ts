import { createId } from '@paralleldrive/cuid2';
import { index, integer, sqliteTable as table, text } from 'drizzle-orm/sqlite-core';
import { users } from './user';

export const cards = table(
  'cards',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),

    certNumber: text('cert_number').notNull().unique(), // e.g. '135618180'
    cardName: text('card_name').notNull(),

    frontImage: text('front_image'),
    backImage: text('back_image'),

    itemGrade: text('item_grade'),
    labelType: text('label_type'),
    reverseCertBarcode: text('reverse_cert_barcode'),
    year: text('year'),
    brandTitle: text('brand_title'),
    subject: text('subject'),
    cardNumber: text('card_number'),
    category: text('category'),
    varietyPedigree: text('variety_pedigree'),

    psaEstimate: text('psa_estimate'),
    psaPopulation: integer('psa_population'),
    psaPopHigher: integer('psa_pop_higher'),

    status: text('status', { enum: ['PENDING', 'APPROVED', 'ACTIVE', 'INACTIVE'] })
      .notNull()
      .default('PENDING'),

    // Audit fields
    createdBy: text('created_by').references(() => users.id),
    updatedBy: text('updated_by').references(() => users.id),
    deletedBy: text('deleted_by').references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$default(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  },
  (t) => [
    index('cards_cert_number_idx').on(t.certNumber),
    index('cards_status_idx').on(t.status),
    index('cards_deleted_at_idx').on(t.deletedAt),
  ],
);
