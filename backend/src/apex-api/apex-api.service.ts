import { Injectable } from '@nestjs/common';
import { InjectBrowser } from 'nest-puppeteer';
import type { Browser } from 'puppeteer';

@Injectable()
export class ApexApiService {

    constructor(
        @InjectBrowser()
        private readonly browser: Browser,
    ) {}

    public async scrapeClubData() {
        // const browser = await puppeteer.launch();
        const page = await this.browser.newPage();
        await page.goto('https://apexlegendsstatus.com/clubs/5109a8f5-5fb6-4a8b-88f0-8c3c47ff627b');


        // Extract club name
        const clubName = await page.$eval('.col-md-3 .legpickrate p', (element) => element.textContent.trim());

        // // Extract club banner image
        // const clubBanner = await page.$eval('.card-header img', (element) => element.getAttribute('src'));

        // // Extract club description
        // const clubDescription = await page.$eval('.card-header p', (element) => element.textContent.trim());

        // Extract club members
        const members = await page.$$eval('.col-md-9 table-responsive tbody tr', (rows) => {
            return rows.map((row) => {
                const name = row.querySelector('td:nth-child(1) a span').textContent.trim();
                const level = row.querySelector('td:nth-child(3)').textContent.trim();
                const xp = row.querySelector('td:nth-child(4)').textContent.trim();
                const joined = row.querySelector('td:nth-child(7) i:first-child').textContent.trim();
                const updated = row.querySelector('td:nth-child(7) i:last-child').textContent.trim();
                return { name, level, xp, joined, updated };
            });
        });

        // // Extract club stats
        // const stats = await page.$$eval('.stats-table tbody tr', (rows) => {
        //     return rows.map((row) => {
        //         const name = row.querySelector('td:nth-child(1)').textContent.trim();
        //         const value = row.querySelector('td:nth-child(2)').textContent.trim();
        //         return { name, value };
        //     });
        // });

        await page.close();

        console.log("Operation complete: ", clubName, members);

        return "OK";
    }
}
