---
trigger: always_on
---

## DRIZZLE ORM — RAW SQL IN SUBQUERIES

Every `sql<T>\`...\``expression inside`.select({})`of a subquery (one that ends with`.as('alias')`) **must** call `.as('columnAlias')` on the expression itself.

### Why

Drizzle cannot infer the column name from the object key when the field is a raw SQL expression. When the outer query JOINs or references the subquery, Drizzle throws a runtime error:

```
Error: You tried to reference "fieldName" field from a subquery, which is a raw SQL field,
but it doesn't have an alias declared. Please add an alias to the field using ".as('alias')" method.
```

### Correct Pattern

```ts
// ✅ Subquery: raw sql expression MUST have .as()
const lastVisitSub = db
  .select({
    customerId: visits.customerId,
    lastVisitAt: sql<Date>`max(${visits.checkinAt})`.as('lastVisitAt'),
  })
  .from(visits)
  .groupBy(visits.customerId)
  .as('lv'); // subquery alias (also required)

// ✅ Outer query JOINs subquery — field resolves correctly
const rows = await db
  .select({ lastVisitAt: lastVisitSub.lastVisitAt })
  .from(customers)
  .leftJoin(lastVisitSub, eq(customers.id, lastVisitSub.customerId));
```

### Forbidden Pattern

```ts
// ❌ Missing .as('lastVisitAt') → runtime error when referenced from outer query
const lastVisitSub = db
  .select({
    customerId: visits.customerId,
    lastVisitAt: sql<Date>`max(${visits.checkinAt})`, // MISSING .as()
  })
  .from(visits)
  .groupBy(visits.customerId)
  .as('lv');
```

### General Rule

> Every `sql<T>\`...\``inside`.select()`of a **subquery** → MUST have`.as('columnName')` matching the object key.

This is **not required** for top-level queries (Drizzle can infer), but is **100% required** for any subquery consumed via `.as('alias')`.
