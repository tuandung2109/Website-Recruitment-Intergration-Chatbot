const routerAccount = require("./account.js");
const routerJobPosting = require("./jobPosting.js");
const routerCompany = require("./company.js");
const routerJobsApplication = require("./jobApplication.js");
const routerInvoice = require("./invoice.js");
const routerIndustry = require("./industry.js");
const routerCv = require("./cv.js");
const routerUserGuide = require("./userGuide");
const routerSkill = require("./skill.js");
const routerMessage = require("./message");

const routerAccountAccountType = require("./account_account_type.js");
const routerAccountType = require("./account_type.js");
const routerCompanyIndustry = require("./company_industry.js");
const routerContacInfo = require("./contact_info");
const routerCvSkill = require("./cv_skill.js");
const routerJobPostingIndustry = require("./job_posting_industry");
const routerJobPostingSkill = require("./job_posting_skill.js");
const routerWordType = require("./work_type");

module.exports = (app) => {
  app.use("/api/account", routerAccount);
  app.use("/api/jobPosting", routerJobPosting);
  app.use("/api/company", routerCompany);
  app.use("/api/jobsApplication", routerJobsApplication);
  app.use("/api/invoice", routerInvoice);
  app.use("/api/cv", routerCv);
  app.use("/api/userGuide", routerUserGuide);
  app.use("/api/industry", routerIndustry);
  app.use("/api/skill", routerSkill);
  app.use("/api/message", routerMessage);

  app.use("/api/account_account_type", routerAccountAccountType);
  app.use("/api/account_type", routerAccountType);
  app.use("/api/company_industry", routerCompanyIndustry);
  app.use("/api/contact_info", routerContacInfo);
  app.use("/api/cv_skill", routerCvSkill);
  app.use("/api/job_posting_industry", routerJobPostingIndustry);
  app.use("/api/job_posting_skill", routerJobPostingSkill);
  app.use("/api/work_type", routerWordType);
};
