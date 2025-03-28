require('dotenv').config();
const { Pool } = require('pg');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(scrypt);

// Define hashPassword function inline
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  try {
    console.log('Connecting to database...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    console.log('Seeding database with initial data...');
    
    // Add a test user if none exists
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', ['testuser']);
    if (existingUser.rows.length === 0) {
      const hashedPassword = await hashPassword('password123');
      
      await pool.query(`
        INSERT INTO users (username, email, password, preferred_theme)
        VALUES ($1, $2, $3, $4)
      `, ['testuser', 'test@example.com', hashedPassword, 'cozy']);
      
      console.log('Created test user: testuser / password123');
    } else {
      console.log('Test user already exists, skipping...');
    }
    
    // Add some initial prompts if none exist
    const existingPrompts = await pool.query('SELECT * FROM prompts');
    if (existingPrompts.rows.length === 0) {
      // Add prompts for the last few days and the next week
      const today = new Date();
      const prompts = [
        {
          text: "What's something you're looking forward to?",
          date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          text: "What made you smile today?",
          date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          text: "What's one small win you had today?",
          date: today // Today
        },
        {
          text: "What's something new you learned recently?",
          date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000) // Tomorrow
        },
        {
          text: "What's a challenge you're currently facing?",
          date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
        },
        {
          text: "What's something you wish you could do more of?",
          date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
        },
        {
          text: "Who is someone that inspires you and why?",
          date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000) // 4 days from now
        }
      ];
      
      for (const prompt of prompts) {
        await pool.query(`
          INSERT INTO prompts (text, active_date, is_active)
          VALUES ($1, $2, $3)
        `, [prompt.text, prompt.date.toISOString().split('T')[0], true]);
      }
      
      console.log(`Added ${prompts.length} initial prompts`);
    } else {
      console.log('Prompts already exist, skipping...');
    }
    
    // Create some initial tags if none exist
    const existingTags = await pool.query('SELECT * FROM tags');
    if (existingTags.rows.length === 0) {
      const tags = [
        { name: 'Work', description: 'Career and professional life', isSystem: true },
        { name: 'Relationships', description: 'Personal connections and interactions', isSystem: true },
        { name: 'Health', description: 'Physical and mental wellbeing', isSystem: true },
        { name: 'Growth', description: 'Personal development and learning', isSystem: true },
        { name: 'Gratitude', description: 'Appreciation and thankfulness', isSystem: true },
        { name: 'Challenges', description: 'Difficulties and obstacles', isSystem: true },
        { name: 'Goals', description: 'Aspirations and targets', isSystem: true },
        { name: 'Reflection', description: 'Introspection and self-awareness', isSystem: true }
      ];
      
      for (const tag of tags) {
        await pool.query(`
          INSERT INTO tags (name, description, is_system)
          VALUES ($1, $2, $3)
        `, [tag.name, tag.description, tag.isSystem]);
      }
      
      console.log(`Added ${tags.length} initial tags`);
    } else {
      console.log('Tags already exist, skipping...');
    }
    
    console.log('Database seeding completed successfully!');
    await pool.end();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();