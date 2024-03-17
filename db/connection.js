import r from 'rethinkdb';
import { tables } from '../utils/globals.js';
async function connectToDB() {
  try {
    const connection = await r.connect({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 28015,
      db: process.env.DB_NAME || "test",
    });

    const existingDatabases = await r.dbList().run(connection);
    if (!existingDatabases.includes(process.env.DB_NAME)) {
      await r.dbCreate(process.env.DB_NAME).run(connection);
    }
    const tableList = await r.tableList().run(connection);
    for (let table in tables) {
      if (!tableList.includes(table)) {
        await r.tableCreate(table).run(connection);
      }
    }
    return connection;
  } catch (error) {
    console.error('Error connecting to RethinkDB:', error);
    process.exit(1);
  }
}

export {
  connectToDB
}
