/**
 * Exposes the newest blog posts as global data so the homepage can render
 * them without a hand-maintained copy of the frontmatter.
 *
 * The previous approach duplicated title, date, description, tags and the
 * permalink of three posts into src/data/homepage.js. Beyond drifting, the
 * hardcoded permalinks meant that renaming or re-slugging any post broke the
 * build under onBrokenLinks: 'throw'.
 *
 * Why this and not the alternatives:
 *
 *   - The blog plugin's own global data only carries its sidebar, which is
 *     title + permalink + date. No description, no tags. The homepage card
 *     renders both.
 *   - A build-time script writing JSON would re-parse frontmatter that
 *     Docusaurus has already parsed, and needs sequencing before the build.
 *
 * allContentLoaded is the only lifecycle where one plugin can read another
 * plugin's loaded content.
 */

module.exports = function latestPostsPlugin(context, options) {
  const { count = 3, blogPluginId = 'default' } = options ?? {};

  return {
    name: 'latest-posts',

    async allContentLoaded({ allContent, actions }) {
      const blogContent =
        allContent['docusaurus-plugin-content-blog']?.[blogPluginId];

      const posts = (blogContent?.blogPosts ?? [])
        .filter((post) => !post.metadata.unlisted)
        // blogPosts arrives sorted newest-first.
        .slice(0, count)
        .map(({ metadata }) => ({
          title: metadata.title,
          permalink: metadata.permalink,
          // formattedDate respects the site locale. `date` is serialised to
          // an ISO string by the global-data JSON round-trip, so it must not
          // be treated as a Date on the client.
          formattedDate: metadata.formattedDate,
          description: metadata.description ?? '',
          readingTime: metadata.readingTime ?? null,
          tags: (metadata.tags ?? []).map((tag) => ({
            label: tag.label,
            permalink: tag.permalink,
          })),
        }));

      actions.setGlobalData({ posts });
    },
  };
};
