-- SEO slug migration for existing posts.
-- Run only after backing up /opt/jackblog/shared/jackblog.db.
-- These updates keep post ids unchanged, so comments/reactions remain attached.

BEGIN TRANSACTION;

UPDATE post SET slug = 'event-loop' WHERE slug = 'post-1775743007845';
UPDATE post SET slug = 'execution-context' WHERE slug = 'post-1775458763748';
UPDATE post SET slug = 'object-literal' WHERE slug = 'post-1773710473028';
UPDATE post SET slug = 'type-conversion-short-circuit' WHERE slug = 'post-1773710420355';
UPDATE post SET slug = 'operators' WHERE slug = 'post-1773710298845';
UPDATE post SET slug = 'data-types' WHERE slug = 'post-1773710193086';
UPDATE post SET slug = 'expression-and-statement' WHERE slug = 'post-1773709982254';
UPDATE post SET slug = 'javascript-variables' WHERE slug = 'js';

-- Personal posts are noindexed by the frontend, but readable URLs are still nicer.
UPDATE post SET slug = 'the-glow-2026' WHERE slug = '2026';
UPDATE post SET slug = 'toeic-speaking-ih' WHERE slug = 'post-1773126868662';
UPDATE post SET slug = 'cat-ddungi' WHERE slug = 'test';

COMMIT;
