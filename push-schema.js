require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  try {
    console.log('Connecting to database...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    console.log('Pushing schema to database...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE,
        preferred_theme VARCHAR(50) DEFAULT 'cozy',
        notification_preferences TEXT DEFAULT '{}'
      );
    `);
    console.log('Users table created');

    // Create prompts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prompts (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        active_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('Prompts table created');

    // Create journal_entries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        prompt_id INTEGER REFERENCES prompts(id),
        initial_response TEXT NOT NULL,
        mood_score INTEGER,
        user_id INTEGER NOT NULL REFERENCES users(id),
        entry_date DATE NOT NULL,
        is_favorite BOOLEAN DEFAULT FALSE
      );
    `);
    console.log('Journal entries table created');

    // Create conversations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        journal_entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
        summary TEXT
      );
    `);
    console.log('Conversations table created');

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        conversation_id INTEGER NOT NULL REFERENCES conversations(id),
        content TEXT NOT NULL,
        role VARCHAR(20) NOT NULL,
        sequence_order INTEGER NOT NULL
      );
    `);
    console.log('Messages table created');

    // Create tags table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        is_system BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('Tags table created');

    // Create entry_tags table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entry_tags (
        id SERIAL PRIMARY KEY,
        journal_entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
        tag_id INTEGER NOT NULL REFERENCES tags(id),
        source VARCHAR(20) NOT NULL,
        confidence_score REAL
      );
    `);
    console.log('Entry tags table created');
    
    // Create session table for connect-pg-simple
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE);
    `);
    
    try {
      await pool.query(`
        ALTER TABLE "session" ADD CONSTRAINT "session_pkey" 
          PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
      `);
    } catch (err) {
      console.log('Primary key constraint already exists, skipping...');
    }
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" 
        ON "session" ("expire");
    `);
    console.log('Session table created');

    console.log('Schema push completed successfully!');
    await pool.end();
  } catch (error) {
    console.error('Error pushing schema:', error);
    process.exit(1);
  }
}

main();