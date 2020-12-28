import { DerectoryPage } from '../spec/derectory.po';
import { browser, logging } from 'protractor';

describe('workspace-project App', () => {
  let page: DerectoryPage;

  beforeAll(async () => {
    page = new DerectoryPage();
    await page.navigateTo();
  });

  describe('individual test', () => {
    beforeEach(() => {
      page = new DerectoryPage();
    });

    it('should display title and table', async () => {
      expect(await page.getTitleView()).toEqual('Addresses List');
    });
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
