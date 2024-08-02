import { Client } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
client.connect();
export async function GET() {
  try {
    const result = await client.query('SELECT * FROM tbl_users');
    return new Response(JSON.stringify(result.rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


//-------------------------------------------------------------------------------------
export async function POST(request) {
  try {
    const { firstname, lastname, username, password } = await request.json();
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    const res = await client.query('INSERT INTO tbl_users (firstname, lastname, username, password) VALUES ($1, $2, $3, $4) RETURNING *', [firstname, lastname, username, hashedPassword]);
    return new Response(JSON.stringify(res.rows[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

//-------------------------------------------------------------------------------------
export async function PUT(request) {
  try {
    const { id, firstname, lastname, password } = await request.json();

    let query = 'UPDATE tbl_users SET firstname = $1, lastname = $2';
    const queryParams = [firstname, lastname];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = $3';
      queryParams.push(hashedPassword);
    }

    query += ' WHERE id = $4 RETURNING *';
    queryParams.push(id);

    const res = await client.query(query, queryParams);

    if (res.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(res.rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

//-------------------------------------------------------------------------------------
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const res = await client.query('DELETE FROM tbl_users WHERE id = $1 RETURNING *', [id]);
    if (res.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(res.rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
//-------------------------------------------------------------------------------------