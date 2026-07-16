CREATE TABLE IF NOT EXISTS likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  target_id INTEGER NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('topic', 'comment')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, target_id, target_type)
);

CREATE INDEX idx_likes_target ON likes(target_id, target_type);
