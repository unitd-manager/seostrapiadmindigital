import { factories } from '@strapi/strapi';

const toNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const MAX_POSTS_PER_COMPONENT = 5;

const clampLimit = (value: unknown, fallback: number = MAX_POSTS_PER_COMPONENT) => {
  const normalized = Math.trunc(toNumber(value, fallback));
  if (normalized <= 0) {
    return fallback;
  }

  return Math.min(normalized, MAX_POSTS_PER_COMPONENT);
};

const orderByIds = (query: any, postIds: number[]) => {
  if (postIds.length === 0) {
    return query;
  }

  const placeholders = postIds.map(() => '?').join(', ');
  return query.orderByRaw(`FIELD(ID, ${placeholders})`, postIds);
};

export default factories.createCoreService('api::post.post', ({ strapi }) => ({
  async getWordPressPosts(filters: any = {}) {
    try {
      const {
        status = 'publish',
        limit = MAX_POSTS_PER_COMPONENT,
        offset = 0,
        postIds = null,
      } = filters;

      let query = strapi.db.connection('qbo_posts');
      const normalizedLimit = clampLimit(limit);
      const normalizedOffset = toNumber(offset, 0);

      if (postIds && postIds.length > 0) {
        query = query.whereIn('ID', postIds);
      } else {
        query = query.where('post_status', status);
      }

      let postsQuery = query
        .select([
          'ID',
          'post_author',
          'post_date_gmt',
          'post_date',
          'post_content',
          'post_title',
          'post_excerpt',
          'post_status',
          'comment_status',
          'ping_status',
          'post_password',
          'post_name',
          'to_ping',
          'pinged',
          'post_modified',
          'post_modified_gmt',
          'post_content_filtered',
          'post_parent',
          'guid',
          'menu_order',
          'post_type',
          'post_mime_type',
          'comment_count',
        ])
        .limit(normalizedLimit)
        .offset(normalizedOffset);

      postsQuery = postIds && postIds.length > 0
        ? orderByIds(postsQuery, postIds)
        : postsQuery.orderBy('post_date', 'desc');

      const posts = await postsQuery;

      const countQuery = strapi.db.connection('qbo_posts');
      if (postIds && postIds.length > 0) {
        countQuery.whereIn('ID', postIds);
      } else {
        countQuery.where('post_status', status);
      }

      const total = await countQuery.count('ID as count').first();

      return {
        posts,
        total: toNumber(total?.count, 0),
        pagination: {
          limit: normalizedLimit,
          offset: normalizedOffset,
          total: toNumber(total?.count, 0),
        },
      };
    } catch (error) {
      strapi.log.error('Error fetching WordPress posts:', error);
      throw error;
    }
  },

  async getWordPressPost(postId: number) {
    try {
      const post = await strapi.db.connection('qbo_posts')
        .select('*')
        .where('ID', postId)
        .first();

      return post || null;
    } catch (error) {
      strapi.log.error(`Error fetching WordPress post ${postId}:`, error);
      throw error;
    }
  },

  async getPostsByIds(postIds: number[]) {
    try {
      if (!postIds || postIds.length === 0) {
        return [];
      }

      const postsQuery = strapi.db.connection('qbo_posts')
        .select('*')
        .whereIn('ID', postIds);

      const posts = await orderByIds(postsQuery, postIds);

      return posts;
    } catch (error) {
      strapi.log.error('Error fetching WordPress posts by IDs:', error);
      throw error;
    }
  },
}));
