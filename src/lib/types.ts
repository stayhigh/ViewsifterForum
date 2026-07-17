export type Category = "AI" | "FIN" | "LIFE";

export interface Topic {
  id: string;
  slug: string;
  category: Category;
  title: string;
  content: string;
  created_at: string;
  user_id?: number;
  user_name?: string;
  user_avatar?: string;
  likes_count?: number;
  comments_count?: number;
}

export interface TopicSummary {
  id: string;
  slug: string;
  category: Category;
  title: string;
  excerpt: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export const CATEGORY_META: Record<Category, { name: string; icon: string; desc: string }> = {
  AI: { name: "科技奇點", icon: "🤖", desc: "人工智慧 · 區塊鏈 · 未來工作" },
  FIN: { name: "財富自由", icon: "📈", desc: "理財投資 · 總體經濟 · 房地產" },
  LIFE: { name: "生命哲學", icon: "🧘", desc: "人生意義 · 心理學 · 經典閱讀" },
};
