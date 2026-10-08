import { desc, eq } from 'drizzle-orm';
import { type DrizzleD1Database } from 'drizzle-orm/d1';
import { posts } from '~/models/post';

export async function getPostBySlug(db: DrizzleD1Database<any>, slug: string) {
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  if (post) {
    await db
      .update(posts)
      .set({ viewCount: (post.viewCount || 0) + 1 })
      .where(eq(posts.id, post.id));
  }
  return post;
}

export async function getPublicPosts(db: DrizzleD1Database<any>) {
  return db.select().from(posts).where(eq(posts.status, 'PUBLISHED')).orderBy(desc(posts.publishedAt));
}

export async function listAdminPosts(db: DrizzleD1Database<any>) {
  return db.select().from(posts).orderBy(desc(posts.createdAt));
}

export async function createPost(db: DrizzleD1Database<any>, data: any, actorId: string) {
  const [post] = await db
    .insert(posts)
    .values({ ...data, authorId: actorId })
    .returning();
  return post;
}

export async function updatePost(db: DrizzleD1Database<any>, id: string, data: any) {
  const [post] = await db
    .update(posts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning();
  return post;
}

export async function deletePost(db: DrizzleD1Database<any>, id: string) {
  await db.delete(posts).where(eq(posts.id, id));
  return true;
}
