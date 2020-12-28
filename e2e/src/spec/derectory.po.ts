import { browser, by, element } from 'protractor';

export class DerectoryPage {
  async navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl);
  }

  async getTitleView(): Promise<string> {
    return element(by.css('.view-title')).getText();
  }
}
