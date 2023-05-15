import { Injectable } from "@nestjs/common";
import { InjectBrowser } from "nest-puppeteer";
import type { Browser } from "puppeteer";

@Injectable()
export class ApexApiScraperService {

    constructor(
        @InjectBrowser()
        private readonly browser: Browser,
    ) {}

    public async getClubData() {
        const page = await this.browser.newPage();
        await page.goto('https://apexlegendsstatus.com/clubs/5109a8f5-5fb6-4a8b-88f0-8c3c47ff627b');

        // Extract club name
        const clubName = await page.$eval('.col-md-3 .legpickrate p', (element) => element.textContent.trim());

        // // Extract club banner image
        // const clubBanner = await page.$eval('.card-header img', (element) => element.getAttribute('src'));

        // const clubBanner = await page.$eval('.card-header img', (element) => element.getAttribute('src'));

        // Extract club members
        const members = await page.$$eval('.table-responsive .table tbody tr', (rows) => {
            let skip = true;
            return rows.map((row) => {
                if (skip) {
                    skip = false;
                    return;
                }
                const returnObj: any = {};

                // Get name
                returnObj.name = row.querySelector(':nth-child(1)')?.textContent.trim();

                // Get penultimate element of href
                returnObj.uuid = row.querySelector(':nth-child(1) a')?.getAttribute('href').split('/').slice(-2)[0];

                // Get level
                returnObj.level = row.querySelector(':nth-child(3)')?.textContent.trim();

                // Get brRankImg
                returnObj.brRankImg = row.querySelector(':nth-child(4) img')?.getAttribute('src');

                // Get brRank from brRankImg
                returnObj.brRank = returnObj.brRankImg ? returnObj.brRankImg.split('/').pop().split('.')[0] : null;
                
                // If rank is admin, get rank from next column
                if (returnObj.brRankImg.includes('club_rank_icon')) {
                    returnObj.brRankImg = row.querySelector(':nth-child(5) img')?.getAttribute('src');
                    returnObj.brRank = returnObj.brRankImg ? returnObj.brRankImg.split('/').pop().split('.')[0] : null;
                }

                // Get brRank data from brRank
                const brRank = returnObj.brRank;
                if (brRank) {
                    returnObj.brRankNumber = brRank.split('').pop();
                    // Get brRank without last character
                    returnObj.brRank = brRank.slice(0, -1);
                }
                // const joined = row.querySelector('td:nth-child(7) i:first-child').textContent.trim().split(' ')[1];
                // const updated = row.querySelector('td:nth-child(7) i:last-child').textContent.trim().split(' ')[1];
                
                return returnObj;
            });
        });

        // Close page
        await page.close();

        // Remove first element of members array (it's empty)
        members.shift();

        return { clubName, members };
    }
}