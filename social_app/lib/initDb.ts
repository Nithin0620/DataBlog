import { Pool } from 'mysql2/promise';

/**
 * Runs CREATE TABLE IF NOT EXISTS for every table the app needs.
 * Called once when the DB pool is first created (see lib/db.ts).
 * Order matters: parent tables (User) must come before child tables
 * that reference them via FOREIGN KEY.
 */
export async function initDb(pool: Pool): Promise<void> {
  const queries = [
    // 1. User — no foreign-key dependencies
    `CREATE TABLE IF NOT EXISTS \`User\` (
      \`id\`        VARCHAR(191) NOT NULL PRIMARY KEY,
      \`username\`  VARCHAR(191) NOT NULL UNIQUE,
      \`email\`     VARCHAR(191) NOT NULL UNIQUE,
      \`password\`  VARCHAR(191) NOT NULL,
      \`createdAt\` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    // 2. Post — depends on User
    `CREATE TABLE IF NOT EXISTS \`Post\` (
      \`id\`        VARCHAR(191) NOT NULL PRIMARY KEY,
      \`content\`   TEXT         NOT NULL,
      \`imageUrl\`  VARCHAR(191) NULL,
      \`createdAt\` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`userId\`    VARCHAR(191) NOT NULL,
      CONSTRAINT \`Post_userId_fkey\`
        FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE
    )`,

    // 3. Like — depends on User and Post
    `CREATE TABLE IF NOT EXISTS \`Like\` (
      \`id\`     VARCHAR(191) NOT NULL PRIMARY KEY,
      \`userId\` VARCHAR(191) NOT NULL,
      \`postId\` VARCHAR(191) NOT NULL,
      UNIQUE KEY \`Like_userId_postId_key\` (\`userId\`, \`postId\`),
      CONSTRAINT \`Like_userId_fkey\`
        FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`Like_postId_fkey\`
        FOREIGN KEY (\`postId\`) REFERENCES \`Post\`(\`id\`) ON DELETE CASCADE
    )`,

    // 4. Comment — depends on User and Post
    `CREATE TABLE IF NOT EXISTS \`Comment\` (
      \`id\`        VARCHAR(191) NOT NULL PRIMARY KEY,
      \`text\`      TEXT         NOT NULL,
      \`createdAt\` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`userId\`    VARCHAR(191) NOT NULL,
      \`postId\`    VARCHAR(191) NOT NULL,
      CONSTRAINT \`Comment_userId_fkey\`
        FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`Comment_postId_fkey\`
        FOREIGN KEY (\`postId\`) REFERENCES \`Post\`(\`id\`) ON DELETE CASCADE
    )`,

    // 5. Follow — self-referencing join on User
    `CREATE TABLE IF NOT EXISTS \`Follow\` (
      \`followerId\`  VARCHAR(191) NOT NULL,
      \`followingId\` VARCHAR(191) NOT NULL,
      PRIMARY KEY (\`followerId\`, \`followingId\`),
      CONSTRAINT \`Follow_followerId_fkey\`
        FOREIGN KEY (\`followerId\`)  REFERENCES \`User\`(\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`Follow_followingId_fkey\`
        FOREIGN KEY (\`followingId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE
    )`,
  ];

  for (const sql of queries) {
    await pool.execute(sql);
  }

  console.log('[initDb] All tables verified / created successfully.');
}
