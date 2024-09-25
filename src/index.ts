import Mongo from "./utils/mongo";
import worker from "./utils/queue";
import server from "./utils/server";

export const database: Mongo = await Mongo.create();
const hostname: string = server.hostname;
console.log(`Server running at hostname: ${hostname}`);
worker.resume();
