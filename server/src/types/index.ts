/**
 * AAIP Server Types
 *
 * Re-exports shared types and adds server-specific types.
 */

// Re-export all shared types
export * from '@aaip/shared';

// Server-specific type aliases (for backward compatibility)
export type { ServerConfig as Config } from '@aaip/shared';
