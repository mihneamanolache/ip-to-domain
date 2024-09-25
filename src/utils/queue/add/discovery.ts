/**
 * Download the newly registered domains (NRD) file from the WHOISDS website and push them to queue.
 */
import { Queue } from "bullmq";
import { format } from "date-fns";
import AdmZip from 'adm-zip';

const queue: Queue<{ domain: string, date: string }, { success: boolean, result?: Array<string>, error?: string }> = new Queue<{ domain: string, date: string }, { success: boolean, result?: Array<string>, error?: string }>("domains");

try {
    console.log("Downloading the newly registered domains (NRD) file from the WHOISDS website");
    /* Create download URL */
    const date: string = format(new Date(Date.now() - 24 * 60 * 60 * 1000), "yyyy-MM-dd");
    const zip_str: string = `${date}.zip`;
    const url: string = `https://www.whoisds.com/whois-database/newly-registered-domains/${btoa(zip_str)}/nrd`;

    /* Download the zip file */
    const download: Response = await fetch(url);
    const arrayBuffer: ArrayBuffer = await download.arrayBuffer();
   
    /* Save the zip file to the disk */
    if ( Bun.env.SAVE_ZIP === "true" )
        await Bun.write(`./zip_archive/${zip_str}`, arrayBuffer);
   
    /* Extract the zip file */
    const buffer: Buffer = Buffer.from(arrayBuffer);
    const zip: AdmZip = new AdmZip(buffer);
    const zipEntries: Array<AdmZip.IZipEntry> = zip.getEntries();
    const compressed: AdmZip.IZipEntry = zipEntries[0];
    const content: string = zip.readAsText(compressed);

    /* Push the domains to the queue */
    const domains: Array<string> = content.split("\n").filter((domain: string): boolean => domain.length > 0);
    console.log("Domains extracted from the zip file:", domains.length);
    for (const domain of domains) {
        const data: { domain: string, date: string } = { domain, date };
        await queue.add("dns", data);
    }

    const currentQueueLength: number = await queue.count();
    console.log("Domains added to the queue. Total domains in the queue:", currentQueueLength);
} catch (e: unknown) {
    console.error(e);
    process.exit(1);
}

process.exit(0);
