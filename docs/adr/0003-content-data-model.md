# 0003: Content data model — unified entry schema with type taxonomy

Every piece of content in the knowledge base uses a single JSON schema with a `type` field for classification. The seven types cover the full Taiwan stock market domain:

- `rule` — 交易規則 (TWSE, TPEx)
- `tax` — 稅制 (財政部, 金管會)
- `market` — 市場數據 (指數, 成交量, 類股)
- `company` — 公司基本資料 (MOPS)
- `financial` — 財務數據 (營收, EPS, 本益比)
- `event` — 重大事件 (除權息, 法說會, 股東會)
- `regulation` — 法規變動 (金管會)

Each entry carries `id`, `source` (name + URL), `tags`, and `updated` fields for traceability.

**Considered options:**
- **Separate schemas per type** — more type safety but harder to search cross-type and more code to maintain for a static site
- **Free-form markdown** — easiest to write but loses structured query/filter capability

**Consequences:** adding a new type requires updating the taxonomy; acceptable since the domain is well-bounded.
