import type Database from "better-sqlite3";

// Database abstraction: uses D1 in production, better-sqlite3 locally
export interface Db {
  prepare(sql: string): {
    bind(...params: any[]): { all(): any[]; get(): any; run(): any };
    all(...params: any[]): any[];
    get(...params: any[]): any;
    run(...params: any[]): any;
  };
  exec(sql: string): void;
}

export function createLocalDb(db: Database): Db {
  return {
    prepare(sql: string) {
      const stmt = db.prepare(sql);
      return {
        bind(...params: any[]) {
          const bound = stmt.bind(...params) as any;
          return {
            all() {
              return bound.all();
            },
            get() {
              return bound.get();
            },
            run() {
              return bound.run();
            },
          };
        },
        all(...params: any[]) {
          return db.prepare(sql).all(...params);
        },
        get(...params: any[]) {
          return db.prepare(sql).get(...params);
        },
        run(...params: any[]) {
          return db.prepare(sql).run(...params);
        },
      };
    },
    exec(sql: string) {
      db.exec(sql);
    },
  };
}

// For use in Astro pages/API routes — adapts D1 or local DB
export function dbFromEnv(env: any): Db | null {
  if (env?.DB) {
    // Cloudflare D1 binding
    return env.DB;
  }
  return null;
}
