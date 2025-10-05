const routerAccount = require("./account.js");
const routerJobPosting = require("./jobPosting.js");
const routerCompany = require("./company.js");
const routerJobsApplication = require("./jobApplication.js");

module.exports = (app) => {
  app.use("/api/account", routerAccount);
  app.use("/api/jobPosting", routerJobPosting);
  app.use("/api/company", routerCompany);
  app.use("/api/jobsApplication", routerJobsApplication);
};
