const { Client } = require('pg');

const client = new Client({
  host: "localhost",
  port: 5433,
  database: "juiceboxdev",
  user: "postgres",
  password: "kizpc"
});

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username
    FROM users;
    `);

  return rows;
}

async function createUser({ username, password }) {
  try {
    const { rows } = await client.query(`
      SELECT id, username
      FROM users;
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  getAllUsers,
  createUser,
}

