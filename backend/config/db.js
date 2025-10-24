import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

// Create a SQL connection using environment variables
export const sql = neon(
  `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require&channel_binding=require`
);

// this sql function we export is used as a tagged template literal, which allows us to write SQL queries safely

// postgresql://neondb_owner:npg_nHbkfFaX4c1y@ep-fancy-pond-a8370j5c-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
