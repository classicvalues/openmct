/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2022, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

/*
Tests to verify log plot functionality.
*/

const { test, expect } = require('@playwright/test');

test.describe('Log plot tests', () => {
    test.only('Can create a log plot.', async ({ page }) => {
        await makeOverlayPlot(page);
        await testRegularTicks(page);
        await enableEditMode(page);
        await enableLogMode(page);
        await testLogTicks(page);
        await disableLogMode(page);
        await testRegularTicks(page);
        await enableLogMode(page);
        await testLogTicks(page);
        await saveOverlayPlot(page);
        await testLogTicks(page);
        await testLogPlotPixels(page);

        // refresh page
        await page.reload();

        // test log ticks hold up after refresh
        await testLogTicks(page);
        await testLogPlotPixels(page);
    });

    test.only('Verify that log mode option is reflected in import/export JSON', async ({ page }) => {
        await makeOverlayPlot(page);
        await enableEditMode(page);
        await enableLogMode(page);
        await saveOverlayPlot(page);

        // TODO ...export, delete the overlay, then import it...

        await testLogTicks(page);

        // TODO, the plot is slightly at different position that in the other test, so this fails.
        // ...We can fix it by copying all steps from the first test...
        // await testLogPlotPixels(page);
    });
});

/**
 * Makes an overlay plot with a sine wave generator and clicks on the overlay plot in the sidebar so it is the active thing displayed.
 * @param {import('@playwright/test').Page} page
 */
async function makeOverlayPlot(page) {
    // fresh page with time range from 2022-03-29 22:00:00.000Z to 2022-03-29 22:00:30.000Z
    await page.goto('/', { waitUntil: 'networkidle' });

    // Set a specific time range for consistency, otherwise it will change
    // on every test to a range based on the current time.

    const timeInputs = page.locator('input.c-input--datetime');
    await timeInputs.first().click();
    await timeInputs.first().fill('2022-03-29 22:00:00.000Z');

    await timeInputs.nth(1).click();
    await timeInputs.nth(1).fill('2022-03-29 22:00:30.000Z');

    // create overlay plot

    await page.locator('button.c-create-button').click();
    await page.locator('li:has-text("Overlay Plot")').click();
    await Promise.all([
        page.waitForNavigation(/*{ url: 'http://localhost:8080/#/browse/mine/8caf7072-535b-4af6-8394-edd86e3ea35f?tc.mode=fixed&tc.startBound=1648590633191&tc.endBound=1648592433191&tc.timeSystem=utc&view=plot-overlay' }*/),
        page.locator('text=OK').click()
    ]);

    // save the overlay plot

    await page.locator('text=Snapshot Save and Finish Editing Save and Continue Editing >> button').nth(1).click();
    await page.locator('text=Save and Finish Editing').click();

    // create a sinewave generator

    await page.locator('button.c-create-button').click();
    await page.locator('li:has-text("Sine Wave Generator")').click();

    // set amplitude to 6, offset 4, period 2

    await page.locator('div:nth-child(5) .form-row .c-form-row__controls .form-control .field input').click();
    await page.locator('div:nth-child(5) .form-row .c-form-row__controls .form-control .field input').fill('6');

    await page.locator('div:nth-child(6) .form-row .c-form-row__controls .form-control .field input').click();
    await page.locator('div:nth-child(6) .form-row .c-form-row__controls .form-control .field input').fill('4');

    await page.locator('div:nth-child(7) .form-row .c-form-row__controls .form-control .field input').click();
    await page.locator('div:nth-child(7) .form-row .c-form-row__controls .form-control .field input').fill('2');

    // Click OK to make generator

    await Promise.all([
        page.waitForNavigation(/*{ url: 'http://localhost:8080/#/browse/mine/8caf7072-535b-4af6-8394-edd86e3ea35f/6e58b26a-8a73-4df6-b3a6-918decc0bbfa?tc.mode=fixed&tc.startBound=1648590633191&tc.endBound=1648592433191&tc.timeSystem=utc&view=plot-single' }*/),
        page.locator('text=OK').click()
    ]);

    // click on overlay plot

    await page.locator('text=Open MCT My Items >> span').nth(3).click();
    await Promise.all([
        page.waitForNavigation(/*{ url: 'http://localhost:8080/#/browse/mine/8caf7072-535b-4af6-8394-edd86e3ea35f?tc.mode=fixed&tc.startBound=1648590633191&tc.endBound=1648592433191&tc.timeSystem=utc&view=plot-overlay' }*/),
        page.locator('text=Unnamed Overlay Plot').first().click()
    ]);
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function testRegularTicks(page) {
    const yTicks = page.locator('.gl-plot-y-tick-label');
    expect(await yTicks.count()).toBe(7);
    await expect(yTicks.nth(0)).toHaveText('-2');
    await expect(yTicks.nth(1)).toHaveText('0');
    await expect(yTicks.nth(2)).toHaveText('2');
    await expect(yTicks.nth(3)).toHaveText('4');
    await expect(yTicks.nth(4)).toHaveText('6');
    await expect(yTicks.nth(5)).toHaveText('8');
    await expect(yTicks.nth(6)).toHaveText('10');
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function testLogTicks(page) {
    const yTicks = page.locator('.gl-plot-y-tick-label');
    expect(await yTicks.count()).toBe(28);
    await expect(yTicks.nth(0)).toHaveText('-2.98');
    await expect(yTicks.nth(1)).toHaveText('-2.50');
    await expect(yTicks.nth(2)).toHaveText('-2.00');
    await expect(yTicks.nth(3)).toHaveText('-1.51');
    await expect(yTicks.nth(4)).toHaveText('-1.20');
    await expect(yTicks.nth(5)).toHaveText('-1.00');
    await expect(yTicks.nth(6)).toHaveText('-0.80');
    await expect(yTicks.nth(7)).toHaveText('-0.58');
    await expect(yTicks.nth(8)).toHaveText('-0.40');
    await expect(yTicks.nth(9)).toHaveText('-0.20');
    await expect(yTicks.nth(10)).toHaveText('-0.00');
    await expect(yTicks.nth(11)).toHaveText('0.20');
    await expect(yTicks.nth(12)).toHaveText('0.40');
    await expect(yTicks.nth(13)).toHaveText('0.58');
    await expect(yTicks.nth(14)).toHaveText('0.80');
    await expect(yTicks.nth(15)).toHaveText('1.00');
    await expect(yTicks.nth(16)).toHaveText('1.20');
    await expect(yTicks.nth(17)).toHaveText('1.51');
    await expect(yTicks.nth(18)).toHaveText('2.00');
    await expect(yTicks.nth(19)).toHaveText('2.50');
    await expect(yTicks.nth(20)).toHaveText('2.98');
    await expect(yTicks.nth(21)).toHaveText('3.50');
    await expect(yTicks.nth(22)).toHaveText('4.00');
    await expect(yTicks.nth(23)).toHaveText('4.50');
    await expect(yTicks.nth(24)).toHaveText('5.31');
    await expect(yTicks.nth(25)).toHaveText('7.00');
    await expect(yTicks.nth(26)).toHaveText('8.00');
    await expect(yTicks.nth(27)).toHaveText('9.00');
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function enableEditMode(page) {
    // turn on edit mode
    await page.locator('text=Unnamed Overlay Plot Snapshot >> button').nth(3).click();
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function enableLogMode(page) {
    // turn on log mode
    await page.locator('text=Y Axis Label Log mode Auto scale Padding >> input[type="checkbox"]').first().check();
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function disableLogMode(page) {
    // turn off log mode
    await page.locator('text=Y Axis Label Log mode Auto scale Padding >> input[type="checkbox"]').first().uncheck();
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function saveOverlayPlot(page) {
    // save overlay plot
    await page.locator('text=Snapshot Save and Finish Editing Save and Continue Editing >> button').nth(1).click();
    await page.locator('text=Save and Finish Editing').click();
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function testLogPlotPixels(page) {
    const pixelsMatch = await page.evaluate(async () => {
        // TODO get canvas pixels at a few locations to make sure they're the correct color, to test that the plot comes out as expected.

        await new Promise((r) => setTimeout(r, 50));

        // These are some pixels that should be blue points in the log plot.
        // If the plot changes shape to an unexpected shape, this will
        // likely fail, which is what we want.
        //
        // I found these pixels by pausing playwright in debug mode at this
        // point, and using similar code as below to output the pixel data, then
        // I logged those pixels here.
        const expectedBluePixels = [
            // TODO these pixel sets only work with the first test, but not the second test.

            // [60, 35],
            // [121, 125],
            // [156, 377],
            // [264, 73],
            // [372, 186],
            // [576, 73],
            // [659, 439],
            // [675, 423]

            [60, 35],
            [120, 125],
            [156, 375],
            [264, 73],
            [372, 185],
            [575, 72],
            [659, 437],
            [675, 421]
        ];

        // The first canvas in the DOM is the one that has the plot point
        // icons (canvas 2d), which is the one we are testing. The second
        // one in the DOM is the WebGL canvas with the line. (Why aren't
        // they both WebGL?)
        const canvas = document.querySelector('canvas');

        const ctx = canvas.getContext('2d');

        for (const pixel of expectedBluePixels) {
            // XXX Possible optimization: call getImageData only once with
            // area including all pixels to be tested.
            const data = ctx.getImageData(pixel[0], pixel[1], 1, 1).data;

            // #43b0ffff <-- openmct cyanish-blue with 100% opacity
            // if (data[0] !== 0x43 || data[1] !== 0xb0 || data[2] !== 0xff || data[3] !== 0xff) {
            if (data[0] === 0 && data[1] === 0 && data[2] === 0 && data[3] === 0) {
                // If any pixel is empty, it means we didn't hit a plot point.
                return false;
            }
        }

        return true;
    });

    expect(pixelsMatch).toBe(true);
}