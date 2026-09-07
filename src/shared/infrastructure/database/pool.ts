import { Pool } from "pg";
import { config } from "../../config/env";

export const dbPool = new Pool({
  connectionString: config.databaseUrl,
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await dbPool.connect();
    client.release();
    return true;
  } catch (error) {
    return false;
  }
}
