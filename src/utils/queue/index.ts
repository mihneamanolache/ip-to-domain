import { type Job, Worker } from "bullmq";
import { promises as dns } from 'dns';
import { Redis } from "ioredis";
import { database } from "../..";
import type { JobResult, JobData } from "./index.types";

const host: string | undefined = Bun.env.REDIS_HOST;
const port: number | undefined = Number(Bun.env.REDIS_PORT);

if (!host || !port) {
  throw new Error("Redis credentials are not set in environment variables");
}

const connection: Redis = new Redis({ host, port, maxRetriesPerRequest: null });

const worker: Worker<JobData, JobResult> = new Worker<JobData, JobResult>(
  "domains",
  async (job: Job<JobData>): Promise<JobResult> => {
    try {
      const result: Array<string> = await dns.resolve4(job.data.domain);
      return { success: true, result };
    } catch (e: unknown) {
      const error: string = e instanceof Error ? e.message : "An unknown error occurred";
      return { success: false, error };
    }
  },
  { connection, concurrency: 10 }
);

worker.on("completed", (job: Job<JobData>, result: JobResult): void => {
  void (async (): Promise<void> => {
    try {
      await database.addOrUpdate(job.data.domain, result);
      await job.remove();
    } catch (error) {
      console.error(`Failed to process job:`, error);
    }
  })();
});

export default worker;

