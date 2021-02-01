// Notes: to load 1000 pages of data from Wuzzuf you need about 100 minutes and about 40 megabyte file size 

// Before realizing that job number wasn't page number it took 28 minutes to load and about 10 MB 

// Before realizing that job number wasn't page number it took 01:40 minutes to load and about 0.5 MB = 518 KB

// Main url https://wuzzuf.net/a/IT-Software-Development-Jobs-in-Egypt?start=0&filters%5Bcountry%5D%5B0%5D=Egypt
const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");



const getJobsFromWuzzuf = async(jobNum) => {
  const MainURL =
    `https://wuzzuf.net/a/IT-Software-Development-Jobs-in-Egypt?start=${jobNum}&filters%5Bcountry%5D%5B0%5D=Egypt&filters%5Bpost_date%5D%5B0%5D=Past%20Week`;
  const { data } = await axios.get(MainURL);
  const $ = cheerio.load(data);
  const jobsTable = $("div.card-has-jobs");
  const jobs = [];
  // Get all available jobs from that page
  jobsTable.find("div.row").each((i, element) => {
    const $element = $(element);
    const job = {};
    // Get main job properties
    job.title = $element.find("div.item-details div.new-time h2.job-title a").attr("title");
    job.url = $element.find("div.item-details div.new-time h2.job-title a").attr("href");
    job.time = $element.find("div.item-details div.new-time span.date time").attr("datetime");

    jobs.push(job);
  });

  // get job requirement property
  jobs.map(async job => {
    try {
      const { data } = await axios.get(encodeURI(job.url));
      const $ = cheerio.load(data);
      job.companyName = $("span.company-name-and-status a.job-company-name").text().trim();
      job.requirements = [];
      $("div.job-requirements ul li").each((i, element) => {
        let req = $(element).text().trim();
        job.requirements.push(req);
      });
      job.responsibilities = [];
      $("span[itemprop=description] ul li").each((i, element) => {
        let resp = $(element).text().trim();
        job.responsibilities.push(resp);
      });
      job.salary = $("tbody tr td dl.salary-info dd[itemprop=value]").text().trim();
      job.jobType = $("tbody tr td span.job-type").text().trim();
      job.level = $("tbody dt:contains(Career Level:)").next().text().trim();
      job.keywords = [];
      $("div.labels-wrapper.job-roles a").each((i, element) => {
        let keyword = $(element).text().trim();
        job.keywords.push(keyword);
      });
      job.lastUpdateApplicantsNum = $("div.applicants-num").text().trim();
      const olderData = fs.readFileSync("logs.txt", 'utf-8');
      fs.writeFileSync("logs.txt", olderData + JSON.stringify(job));
      // console.log(job);
      // console.log(jobNum);

    } catch (err) {
      console.log(err);
    }
  });
  return jobNum;
}

const main = (jobNum) => {
  getJobsFromWuzzuf(jobNum).then((jobNum) => {
    if (jobNum < 300) {
      jobNum = jobNum + 20;
      main(jobNum);
    } else {
      return;
    }
  }).catch(err => console.log(err));
}

main(0);