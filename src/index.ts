import chalk from 'chalk';
import figlet from 'figlet';
import puppeteer from 'puppeteer';
import inquirer from 'inquirer';

const delay = async (time: number) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

console.log(
  chalk.red(
    figlet.textSync('Seo Content Generator', {
      horizontalLayout: 'default',
      verticalLayout: 'default',
    }),
  ),
);

(async () => {
  const questions = [
    {
      name: 'query',
      type: 'input',
      message: 'Enter the keyword to search, enter q to quit',
      validate: function (value: string) {
        if (value.length) {
          return true;
        } else {
          return 'Enter the keyword to search, enter q to quit';
        }
      },
    },
  ];
  const answer = await inquirer.prompt(questions);
  if (answer.query === 'q') {
    process.exit();
  }
  const searchStr = answer.query;
  const browser = await puppeteer.launch();
  // const browser = await puppeteer.launch({
  //   headless: false,
  //   args: ['--no-sandbox', '--disable-setuid-sandbox'],
  // });
  const page = await browser.newPage();

  await page.goto('https://google.com');
  // simple selector for search box
  await page.click('[name=q]');
  await page.keyboard.type(searchStr);
  await delay(2000);
  const searchSuggestion = await page.evaluate(() => {
    const ss: string[] = [];
    const searchList = document.querySelectorAll('[role=listbox]');
    if (searchList.length > 0) {
      const elements = searchList[0].getElementsByTagName('li');
      Array.from(elements).forEach((e) => {
        const spans = e.getElementsByTagName('span');
        if (spans.length > 0) {
          ss.push(spans[0].innerText);
        }
      });
    }
    return ss;
  });
  console.log(chalk.blue('Search Suggestion: '));
  console.log(searchSuggestion);
  await page.keyboard.press('Enter');
  // wait for search results
  await page.waitForSelector('h3.LC20lb', { timeout: 10000 });

  const LSIKeyword = await page.evaluate(() => {
    const ss: string[] = [];
    const lsiParentContainer = document.querySelectorAll('#botstuff #bres');
    if (lsiParentContainer.length > 0) {
      const lsiContainer = <HTMLDivElement>lsiParentContainer[0]?.lastChild?.firstChild?.lastChild?.lastChild;
      if (lsiContainer) {
        const elements = lsiContainer.getElementsByTagName('a');
        Array.from(elements).forEach((e) => {
          if (e.lastChild) {
            ss.push((e.lastChild as HTMLDivElement).innerText);
          }
        });
      }
    }
    return ss;
  });
  console.log(chalk.blue('LSI Kewords'));
  console.log(LSIKeyword);
  await browser.close();
})();
