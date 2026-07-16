CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('AI', 'FIN', 'LIFE')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_topics_category ON topics(category);
CREATE INDEX idx_topics_slug ON topics(slug);
CREATE INDEX idx_topics_created_at ON topics(created_at);
