const routerAccount = require("./account.js");
const routerJobPosting = require("./jobPosting.js");
const routerCompany = require("./company.js");
const routerJobsApplication = require("./jobApplication.js");
const routerInvoice = require("./invoice.js");
const routerIndustry = require("./industry.js");
const routerCv = require("./cv.js");
const routerUserGuide = require("./userGuide");

module.exports = (app) => {
  app.use("/api/account", routerAccount);
  app.use("/api/jobPosting", routerJobPosting);
  app.use("/api/company", routerCompany);
  app.use("/api/jobsApplication", routerJobsApplication);
  app.use("/api/invoice", routerInvoice);
  app.use("/api/cv", routerCv);
  app.use("/api/userGuide", routerUserGuide);
};
