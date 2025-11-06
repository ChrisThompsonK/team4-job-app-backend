const reporter = require('cucumber-html-reporter');

const options = {
  theme: 'bootstrap',
  jsonFile: 'tests/cucumber/report/cucumber_report.json',
  output: 'tests/cucumber/report/cucumber_report.html',
  reportSuiteAsScenarios: true,
  launchReport: false,
  metadata: {
    "Test Environment": "Local",
    "Platform": process.platform,
    "Executed": "Local"
  }
};

reporter.generate(options);
