import { test, expect } from '@playwright/test';

test.describe('Workout Configuration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/advanced/index.html');
    });

    test('should allow adding a new set and display it correctly', async ({ page }) => {
        await page.click('#addSetBtn');
        const setCount = await page.$$eval('.set', sets => sets.length);
        expect(setCount).toBe(1);
    });

    test('should correctly number sets based on how many have been added', async ({ page }) => {
        await page.click('#addSetBtn');
        await page.click('#addSetBtn');
        const setTitle = await page.locator('[data-testid="set-2"] h2').innerText();
        expect(setTitle).toBe('Set 2');
    });

    test('should allow deleting a set and reflect the change in the displayed sets', async ({ page }) => {
        await page.click('#addSetBtn');
        await page.getByTestId('set-1-delete-set').click();
        const sets = await page.locator('.set').all();
        expect(sets).toHaveLength(0);
    });

    test('should allow adding intervals within a set', async ({ page }) => {
        await page.click('#addSetBtn');
        await page.getByTestId('set-1-add-interval').click();
        const intervals = await page.locator('[data-testid="set-1"] .interval').all();
        expect(intervals).toHaveLength(1);
    });

    test('should allow deleting intervals within a set', async ({ page }) => {
        await page.click('#addSetBtn');
        await page.getByTestId('set-1-add-interval').click();
        await page.getByTestId('set-1-interval-1-delete-interval').click();
        const intervals = await page.locator('[data-testid="set-1"] .interval').all();
        expect(intervals).toHaveLength(0);
    });

    test('should not allow saving if any interval is missing a name or duration', async ({ page }) => {
        await page.click('#addSetBtn');
        await page.getByTestId('set-1-add-interval').click();
        await page.click('#saveBtn');
        const errorMessage = await page.locator('.validation-error').textContent();
        expect(errorMessage).toBe('Please ensure this interval has both a name and a duration.');
    });

    test('should not allow saving if any set does not have at least one interval', async ({ page }) => {
        await page.click('#addSetBtn');
        await page.click('#saveBtn');
        const errorMessage = await page.locator('.validation-error').textContent();
        expect(errorMessage).toBe('Please add at least one interval to this set.');
    });

    test('should switch to read-only mode when the "Save" button is clicked and all validations pass', async ({ page }) => {
        await page.click('#addSetBtn');
        await page.getByTestId('set-1-add-interval').click();
        await page.getByTestId('set-1-interval-1-name').fill('Work');
        await page.getByTestId('set-1-interval-1-duration').fill('30');
        await page.click('#saveBtn');
        const isFormVisible = await page.isVisible('#setsContainer');
        const isReadOnlyVisible = await page.isVisible('#readOnlyContainer');
        expect(isFormVisible).toBe(false);
        expect(isReadOnlyVisible).toBe(true);
    });

    test('should not display the save button if no sets are present', async ({ page }) => {
        const isSaveVisible = await page.isVisible('#saveBtn');
        expect(isSaveVisible).toBe(false);
    });

    test('should allow editing the set when the "Edit" button is clicked in read-only mode', async ({ page }) => {
        // Setting up read-only mode
        await page.click('#addSetBtn');
        await page.getByTestId('set-1-add-interval').click();
        await page.getByTestId('set-1-interval-1-name').fill('Work');
        await page.getByTestId('set-1-interval-1-duration').fill('30');
        await page.click('#saveBtn');

        // Switch to edit mode
        await page.click('#editBtn');
        const isFormVisible = await page.isVisible('#setsContainer');
        const isReadOnlyVisible = await page.isVisible('#readOnlyContainer');
        expect(isFormVisible).toBe(true);
        expect(isReadOnlyVisible).toBe(false);
    });

    test('should reflect changes made in edit mode when saved again', async ({ page }) => {
        // Setting up read-only mode
        await page.click('#addSetBtn');
        await page.getByTestId('set-1-add-interval').click();
        await page.getByTestId('set-1-interval-1-name').fill('Work');
        await page.getByTestId('set-1-interval-1-duration').fill('30');
        await page.click('#saveBtn');

        // Switch to edit mode and make changes
        await page.click('#editBtn');
        await page.getByTestId('set-1-interval-1-name').fill('Rest');
        await page.getByTestId('set-1-rounds').fill('3');
        await page.getByTestId('set-1-interval-1-duration').fill('10');

        // Save and switch back to read-only mode
        await page.click('#saveBtn');
        const intervalName = await page.getByTestId('readonly-set-1-interval-1-name').textContent();
        const intervalDuration = await page.getByTestId('readonly-set-1-interval-1-duration').textContent();
        const rounds = await page.getByTestId('readonly-set-1-rounds').textContent();

        expect(intervalName).toBe('Rest');
        expect(intervalDuration).toContain('10 seconds');
        expect(rounds).toContain('3 Rounds');
    });

    test('should display validation error if interval duration is missing', async ({ page }) => {
        await page.click('#addSetBtn');
        await page.getByTestId('set-1-add-interval').click();
        await page.getByTestId('set-1-interval-1-name').fill('Work');
        await page.getByTestId('set-1-interval-1-duration').fill('');
        await page.click('#saveBtn');

        const errorMessage = await page.locator('.validation-error').textContent();
        expect(errorMessage).toBe('Please ensure this interval has both a name and a duration.');
    });

    test('should display "Rest" element only if there is a rest duration', async ({ page }) => {
        // Add a set and an interval
        await page.click('#addSetBtn');
        await page.getByTestId('set-1-add-interval').click();
        await page.getByTestId('set-1-interval-1-name').fill('Work');
        await page.getByTestId('set-1-interval-1-duration').fill('30');
        await page.getByTestId('set-1-rest').fill('0');
    
        // Save and check that there's no "Rest" element displayed
        await page.click('#saveBtn');
        const restElementExistsInitially = await page.locator('[data-testid="readonly-set-1-rest"]').isVisible();
        expect(restElementExistsInitially).toBe(false);
    
        // Edit, add rest duration, and save again
        await page.click('#editBtn');
        await page.getByTestId('set-1-rest').fill('10');
        await page.click('#saveBtn');
    
        // Check if the "Rest" element is now displayed
        const restElementExistsAfterAddingRest = await page.locator('[data-testid="readonly-set-1-rest"]').isVisible();
        expect(restElementExistsAfterAddingRest).toBe(true);
    });    
});

