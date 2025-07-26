import { connect } from "mongoose";
import config from "../config/index.js";

export async function connectDB() {
    try {
        await connect(config.MONGO_URI);
        console.log('Database connected');
    } catch (err) {
        console.log('Error on connecting database', err.message);
        process.exit(1);
    }
}