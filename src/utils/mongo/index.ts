import type { JobResult } from "../queue/index.types";
import { type Db, MongoClient, type Collection, type WithId } from "mongodb";

export interface DomainData {
    domain_name:        string;
    current_ipv4:       string;
    historical_ipv4s:   Array<string>; 
    last_checked:       Date;
    error?:             string | null;
}

export default class Mongo {
    private client: MongoClient | null = null;
    private db: Db;

    /**
     * Private constructor to enforce use of the static create method.
     */
    private constructor(client: MongoClient, db: Db) {
        this.client = client;
        this.db = db;
        void this.ensureIndexes();
    }

    /**
     * Creates a new instance of the Mongo class and establishes a connection to the MongoDB instance.
     */
    public static async create(): Promise<Mongo> {
        const user: string | undefined = Bun.env.MONGO_USER;
        const pass: string | undefined = Bun.env.MONGO_PASS;
        const host: string | undefined = Bun.env.MONGO_HOST;
        const port: string | undefined = Bun.env.MONGO_PORT;
        if (!user || !pass || !host || !port) {
            throw new Error("MongoDB credentials are not set in environment variables");
        }
        const uri: string = `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}`;
        const client: MongoClient = new MongoClient(uri);
        await client.connect();
        const db: Db = client.db("domains");
        console.log('Connected to MongoDB');
        return new Mongo(client, db);
    }

    /**
     * Ensures that the required indexes are created on the collection.
     */
    private async ensureIndexes(): Promise<void> {
        const collection: Collection<DomainData> = this.db.collection<DomainData>("dns");
        await collection.createIndex({ current_ipv4: 1 });
        console.log('Indexes ensured on collection');
    }

    /**
     * Adds or updates a domain's data in the database, respecting the DomainData interface.
     * Ensures that historical_ipv4s contains unique values.
     * @param domain_name - The domain name.
     * @param data - An object containing the result of the DNS lookup.
     */
    public async addOrUpdate(domain_name: string, data: JobResult): Promise<void> {
        const collection: Collection<DomainData> = this.db.collection<DomainData>("dns");

        if (data.success && data.result && data.result.length > 0) {
            const newIp: string = data.result[0]; 
            const existingDoc: WithId<DomainData> | null = await collection.findOne({ domain_name });
            if (existingDoc) {
                if (existingDoc.current_ipv4 !== newIp) {
                    await collection.updateOne(
                        { domain_name },
                        {
                            $set: {
                                current_ipv4: newIp,
                                last_checked: new Date(),
                                error: null,
                            },
                            $addToSet: {
                                historical_ipv4s: existingDoc.current_ipv4,
                            },
                        }
                    );
                } else {
                    await collection.updateOne(
                        { domain_name },
                        {
                            $set: {
                                last_checked: new Date(),
                                error: null,
                            },
                        }
                    );
                }
            } else {
                const domainData: DomainData = {
                    domain_name,
                    current_ipv4: newIp,
                    historical_ipv4s: [],
                    last_checked: new Date(),
                };
                await collection.insertOne(domainData);
            }
        } else {
            await collection.updateOne(
                { domain_name },
                {
                    $set: {
                        error: data.error ?? 'Unknown error',
                        last_checked: new Date(),
                    },
                    $setOnInsert: {
                        current_ipv4: undefined,
                        historical_ipv4s: [],
                        domain_name,
                    },
                },
                { upsert: true }
            );
        }
    }

    /**
     * Retrieves all domains that have the specified IP as their current IPv4 address.
     * @param ip - The IP address to query.
     * @returns A Promise that resolves to an array of domain names.
     */
    public async getDomainsByIP(ip: string): Promise<Array<string>> {
        const collection: Collection<DomainData> = this.db.collection<DomainData>("dns");

        // Perform the query and project the necessary fields
        const domains: Array<WithId<DomainData>> = await collection
            .find({ current_ipv4: ip })
            .project({ domain_name: 1, current_ipv4: 1, historical_ipv4s: 1, last_checked: 1, error: 1 }) 
            .toArray() as Array<WithId<DomainData>>; 

        return domains.map((doc): string => doc.domain_name);
    }

    /**
     * Closes the MongoDB connection.
     */
    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            console.log('Disconnected from MongoDB');
        }
    }
}
