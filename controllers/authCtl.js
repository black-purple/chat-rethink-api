import { connectToDB } from '../db/connection.js';
import r from 'rethinkdb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { tables } from '../utils/globals.js';

const createUser = async (req, res) => {
    const { givenName, familyName, email, password } = req.body;
    // Checking all required fields
    if (givenName && familyName && email && password) {
        const conn = await connectToDB();
        if (conn) {
            const result = await r.table(tables[0])
                .filter({ email })
                .limit(1)
                .run(conn);

            const re = result.toArray(async (err, result) => {
                // Checking if a user with the same email exists
                if (result.length === 0) {
                    // Hashing the password
                    const salt = await bcrypt.genSalt(10);
                    const passwordHash = await bcrypt.hash(password, salt);

                    // Generating the user object
                    const user = {
                        email: email,
                        password: passwordHash,
                        givenName: givenName,
                        familyName: familyName,
                        rooms: []
                    };

                    try {
                        // Inserting the user into the DB table "users"
                        const result = await r.table(tables[0]).insert(user).run(conn);
                        res.status(201).json({ success: true, message: "User created successfully" });
                    } catch (error) {
                        console.error('Error creating user:', error);
                    } finally {
                        res.status(201).json({ success: true, message: "User created successfully" });
                    }
                } else {
                    res.status(409).json({ error: 'An account with the same email already exists' });
                }
            });

        } else {
            res.status(500).json({ error: 'Cannot connect to DB' });
        }
        await conn.close();
    } else {
        res.status(400).json({ error: 'All fields { givenName, familyName, email, password } are required' });
    }
}

const authenticateUser = async (req, res) => {
    const { email, password } = req.body;
    // Checking all required fields
    if (email && password) {
        const conn = await connectToDB();
        try {
            const result = await r.table(tables[0])
                .filter({ email })
                .run(conn);

            result.toArray(async (err, users) => {
                const user = users[0];

                const passwordMatch = await bcrypt.compare(password, user.password);
                if (passwordMatch) {
                    const payload = { id: user.id, email: user.email };
                    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
                    res.json({ token, rooms: user.rooms });
                }
            });
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error; // Re-throw for handling in API routes
        } finally {
            await conn.close();
        }
    } else {
        res.json({ error: 'All fields { email, password } are required' });
    }
}
export {
    createUser,
    authenticateUser
}