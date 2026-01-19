-- JackBlog Database Schema for SQLite
-- Note: With JPA ddl-auto=update, tables are created automatically.
-- This file is for reference or manual setup.

-- Post 테이블
CREATE TABLE IF NOT EXISTS post (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    content_html TEXT NOT NULL,
    excerpt VARCHAR(500),
    category VARCHAR(100) NOT NULL,
    reading_time INTEGER,
    view_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- Comment 테이블 (계층형)
CREATE TABLE IF NOT EXISTS comment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER REFERENCES post(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES comment(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT 0,
    depth INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reaction 테이블 (이모지 반응)
CREATE TABLE IF NOT EXISTS reaction (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER REFERENCES post(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, emoji, client_id)
);

-- PostLike 테이블
CREATE TABLE IF NOT EXISTS post_like (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER REFERENCES post(id) ON DELETE CASCADE,
    client_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, client_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_post_slug ON post(slug);
CREATE INDEX IF NOT EXISTS idx_post_category ON post(category);
CREATE INDEX IF NOT EXISTS idx_post_published ON post(is_published);
CREATE INDEX IF NOT EXISTS idx_comment_post_id ON comment(post_id);
CREATE INDEX IF NOT EXISTS idx_comment_parent_id ON comment(parent_id);
CREATE INDEX IF NOT EXISTS idx_reaction_post_id ON reaction(post_id);
CREATE INDEX IF NOT EXISTS idx_post_like_post_id ON post_like(post_id);
