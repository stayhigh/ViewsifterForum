# ViewsForum Test Scenarios

**Product:** ViewsForum v0.1 MVP  
**Date:** 2026-07-17  
**Test Environment:** `http://localhost:4321` (dev), `https://forum.viewsifter.com` (prod)

---

## TS-01: Guest Browsing Experience

**Test Objective:** Verify unauthenticated visitors can freely browse all content but cannot create, reply, or like.

**User Role:** Guest (未登入)

### TS-01.1: Homepage Loads with Content

**Starting Conditions:** No cookies. Local DB populated with 20 seed topics.

**Test Steps:**
1. Open `http://localhost:4321/` → Page renders ViewsForum hero + 3 category cards
2. Check category cards → Three entries visible: 🤖 科技奇點, 📈 財富自由, 🧘 生命哲學
3. Check "最新討論" section → 6 most recent topic cards with title + excerpt + category tag
4. Check footer → "共 20 篇討論" displayed
5. Check nav bar → "登入" and "註冊" links visible, no user avatar

**Expected Outcomes:**
- Page renders in < 1.5s
- `lang="zh-TW"` in `<html>`
- No "發文" button visible
- 20 篇討論 count accurate

### TS-01.2: Category Pages Filter Correctly

**Starting Conditions:** Same as TS-01.1.

**Test Steps:**
1. Click "科技奇點" → URL is `/category/ai`, page title shows "科技奇點"
2. Count topic cards → 7 articles with category tag "科技奇點"
3. Click "財富自由" → URL is `/category/fin`, 7 articles
4. Click "生命哲學" → URL is `/category/life`, 6 articles
5. Navigate to `/category/nonexistent` → 404 Not Found

**Expected Outcomes:**
- Each category shows correct count (AI:7, FIN:7, LIFE:6)
- "← 返回首頁" backlink works on all category pages
- Invalid category returns 404

### TS-01.3: Topic Detail Page Renders Markdown

**Starting Conditions:** Same as TS-01.1.

**Test Steps:**
1. Click any topic from homepage → URL is `/topic/SLUG`
2. Check article header → Title + date + category badge displayed
3. Check article body → Markdown rendered as HTML (H2, H3, lists, blockquotes, strong)
4. Check back link → Links to correct category page
5. Navigate to `/topic/nonexistent-slug` → 404 Not Found
6. Check "討論" section → "尚無回覆，登入後參與討論" empty state

**Expected Outcomes:**
- Content body uses `.article-body` class with Wabi-Sabi typography
- Markdown headings, lists, bold, blockquotes render correctly
- No reply form visible (unauthenticated)

---

## TS-02: User Registration

**Test Objective:** Verify new users can create an account with email + password.

**User Role:** Guest → Member

### TS-02.1: Successful Registration

**Starting Conditions:** Clean cookies. Local D1 has `users` table with `password_hash` column.

**Test Steps:**
1. Click "註冊" in nav → `/auth/register` loads with form (name, email, password)
2. Enter name "測試者", email "test@example.com", password "test1234"
3. Click "建立帳號" → Redirect to `/` (302)
4. Check nav bar → "測試者" displayed with avatar placeholder + "登出" + "發文" links
5. Check cookies → `session` and `user_info` cookies set

**Expected Outcomes:**
- Password stored as bcrypt hash (not plaintext)
- User row in D1 has `google_id = NULL`, `password_hash` set
- Session cookie has 7-day expiry

### TS-02.2: Duplicate Email

**Starting Conditions:** User "test@example.com" already exists from TS-02.1.

**Test Steps:**
1. Go to `/auth/register`
2. Enter same email "test@example.com", different name, any password
3. Click "建立帳號" → Redirect to `/auth/register?msg=此+Email+已被註冊`
4. Check page → Error message displayed

**Expected Outcomes:**
- No duplicate user row created
- Error message displayed clearly

### TS-02.3: Invalid Registration Inputs

**Test Steps:**
1. Submit empty form → Redirect with "請填寫所有欄位"
2. Password < 8 chars → Redirect with "密碼至少需要 8 個字元"
3. Missing email format → Browser native validation blocks submit

**Expected Outcomes:**
- Server-side validation on all fields
- Client-side HTML5 validation on email field

---

## TS-03: User Login / Logout

**Test Objective:** Verify email + password login and session management.

### TS-03.1: Successful Login

**Starting Conditions:** User "test@example.com" registered from TS-02.1.

**Test Steps:**
1. Click "登入" → `/auth/login` loads with email + password fields
2. Enter email "test@example.com", password "test1234"
3. Click "登入" → Redirect to `/` (302)
4. Check nav bar → "測試者" displayed, logged-in state

**Expected Outcomes:**
- Password verified via bcrypt.compare
- Session + user_info cookies set

### TS-03.2: Wrong Password

**Test Steps:**
1. Go to `/auth/login`
2. Enter email "test@example.com", wrong password "wrongpass"
3. Click "登入" → Redirect with "Email 或密碼錯誤"

**Expected Outcomes:**
- No session cookie set
- Error message displayed

### TS-03.3: Logout

**Starting Conditions:** Logged in as test@example.com.

**Test Steps:**
1. Click "登出" → Redirect to `/` (302)
2. Check nav bar → "登入" and "註冊" visible again
3. Check cookies → `session` and `user_info` cookies deleted

**Expected Outcomes:**
- User returns to Guest state
- No session cookies remain

---

## TS-04: Create Topic

**Test Objective:** Verify authenticated users can create new discussion topics.

**User Role:** Member (已登入)

### TS-04.1: Create Topic (Happy Path)

**Starting Conditions:** Logged in as test@example.com. D1 has topics table with seed data.

**Test Steps:**
1. Click "發文" → `/topic/new` loads with form
2. Select category "科技奇點" (AI)
3. Enter title "測試文章標題"
4. Enter markdown content "## 這是測試\n\n內容測試 **粗體**"
5. Click "發佈" → POST to `/api/topics`, INSERT into D1
6. Redirect to new topic page `/topic/{timestamp}-{random}` (e.g. `/topic/1784291505889-a3f8k2`)

**Expected Outcomes:**
- Slug = `{Date.now()}-{random6chars}` format, entirely ASCII
- Category saved correctly
- Topic appears on homepage and category page
- Author name displayed on topic page
- Topic detail page loads and renders Markdown content

### TS-04.2: Create Topic — Unauthenticated

**Starting Conditions:** Guest user (no cookies).

**Test Steps:**
1. Navigate directly to `/topic/new` → 302 redirect to `/auth/login`
2. Click "發佈" button hidden for Guest users

**Expected Outcomes:**
- Guests cannot access create-topic page
- Clear redirect to login

### TS-04.3: Validation Limits

**Test Steps:**
1. Enter title > 50 characters → truncated or rejected
2. Enter content > 10,000 characters → truncated or rejected
3. No category selected → form validation error

**Expected Outcomes:**
- Title max 50 characters
- Content max 10,000 characters
- Category required

---

## TS-05: Replies (Comments)

**Test Objective:** Verify authenticated users can reply to topics (flat, 樓層式).

**User Role:** Member

### TS-05.1: Reply to Topic

**Starting Conditions:** Logged in. At least one topic exists.

**Test Steps:**
1. View any topic → Reply form visible below article (for logged-in user)
2. Enter reply content "這是一則回覆測試"
3. Click "回覆" → POST to `/api/comments`
4. Page refreshes → Reply appears below article in chronological order

**Expected Outcomes:**
- Reply shown with author name + timestamp
- Flat layout (no threading/nesting)
- Newest reply at bottom

### TS-05.2: Reply — Unauthenticated

**Test Steps:**
1. View topic as Guest → "登入後參與討論" message, no reply form
2. POST to `/api/comments` without cookies → 401 Unauthorized

**Expected Outcomes:**
- Guests cannot reply
- API rejects unauthenticated requests

---

## TS-06: Likes

**Test Objective:** Verify like/unlike toggle on topics and comments.

**User Role:** Member

### TS-06.1: Like a Topic

**Starting Conditions:** Logged in as test@example.com. Topic exists.

**Test Steps:**
1. View topic → Like button visible
2. Click "讚" → POST to `/api/likes` with `target_type=topic`
3. Like count increments → Button shows "已讚" state
4. Click again → Unlike (toggle), count decrements

**Expected Outcomes:**
- One like per user per target (UNIQUE constraint)
- Toggle behavior: like → unlike → like
- Count updates without page refresh (eventually)

### TS-06.2: Like — Unauthenticated

**Test Steps:**
1. View topic as Guest → Like button visible but clicking triggers redirect to login

**Expected Outcomes:**
- Guests cannot like
- Graceful redirect to login

---

## TS-07: Design & Responsiveness

**Test Objective:** Verify Wabi-Sabi aesthetic and responsive layout.

### TS-07.1: Wabi-Sabi Design Tokens

**Test Steps:**
1. Open any page → Inspect CSS custom properties
2. Verify `--color-paper: #F9F7F1` (米白紙張色)
3. Verify `--color-ink: #2C2C2C` (墨黑)
4. Verify `--color-earth: #8B7355` (古銅)
5. Verify `--color-border` and `--color-muted` tokens exist
6. Check no box-shadows or gradients on main content
7. Check minimal border-radius (4px or 0px)

**Expected Outcomes:**
- No bright blue links (use `--color-earth`)
- Generous whitespace padding
- Typography: letter-spacing, line-height 1.8+
- No animations or transitions on content (subtle hover only)

### TS-07.2: Responsive Design (RWD)

**Test Steps:**
1. Test at viewport 320px → Single column, readable font size
2. Test at viewport 768px → Category cards wrap
3. Test at viewport 1024px → Comfortable max-width (~720px content)
4. Test at viewport 1440px → Centered layout with whitespace

**Expected Outcomes:**
- No horizontal scroll at any viewport ≥ 320px
- Form inputs full-width on mobile
- Nav bar items readable (not overflowing)

---

## TS-08: Performance & Edge Cases

### TS-08.1: Page Load Performance

**Test Steps:**
1. Measure homepage TTFB → < 500ms
2. Measure LCP → < 2.5s
3. Measure TTI → < 1.5s

### TS-08.2: 404 Handling

**Test Steps:**
1. `/topic/nonexistent` → 404 with "Not Found"
2. `/category/nonexistent` → 404 with "Not Found"
3. Random path → 404

### TS-08.3: Content XSS Protection

**Test Steps:**
1. Create topic with `<script>alert('xss')</script>` in content
2. View topic → Script is NOT executed (rendered as text or stripped)

**Expected Outcomes:**
- User input sanitized before rendering
- No XSS execution

---

## Summary

| Scenario | Tests | Critical |
|---|---|---|
| TS-01: Guest Browsing | 3 | ✅ |
| TS-02: Registration | 3 | ✅ |
| TS-03: Login/Logout | 3 | ✅ |
| TS-04: Create Topic | 3 | ✅ |
| TS-05: Replies | 2 | 🔧 |
| TS-06: Likes | 2 | 🔧 |
| TS-07: Design & RWD | 2 | ✅ |
| TS-08: Performance | 3 | 🔧 |

**Total:** 21 test scenarios across 8 user stories.
