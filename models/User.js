const db = require('../config/db'); // Import your database connection
const bcrypt = require('bcryptjs');

class User {
    constructor(id, name, email, password, phone, role_id) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role_id = role_id;
    }

    /**
     * Find a user by email
     */
    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            const user = rows[0];
            return new User(user.id, user.name, user.email, user.password, user.phone, user.role_id);
        }
        return null; // Return null if no user is found
    }

    /**
     * Create a new user
     */
    static async create({ name, email, password, phone }) {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into the database
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, phone, role_id) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, 7] // Default role_id for 'donor'
        );

        return result.insertId; // Return the ID of the newly created user
    }
}

module.exports = User;