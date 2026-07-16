/// <reference types="astro/client" />

declare module "*.json" {
  const value: any;
  export default value;
}

// Minimal Cloudflare types to avoid full workers-types conflict
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1Result>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
  raw<T = unknown>(): Promise<T[][]>;
}

interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: any;
}

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        GOOGLE_CLIENT_ID?: string;
        GOOGLE_CLIENT_SECRET?: string;
        GOOGLE_REDIRECT_URI?: string;
        DB?: D1Database;
        SESSION?: KVNamespace;
      };
    };
    user?: {
      id: number;
      name: string;
      avatar: string;
      email: string;
    };
  }
}
