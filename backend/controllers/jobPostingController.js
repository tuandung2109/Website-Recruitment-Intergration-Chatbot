// controllers/jobPostingController.js
const supabase = require("../config/supabase");

// GET /api/jobs
// Optional query params: page, limit, search, location, status
async function getJobs(req, res) {
  try {
    console.log("[GET] /api/jobs", req.query);
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);
    const offset = (page - 1) * limit;
    const search = (req.query.search || "").trim();
    const location = (req.query.location || "").trim();
    const status = (req.query.status || "").trim();
    const workTypes = (req.query.workTypes || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const industryNames = (req.query.industries || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const salaryMin = req.query.salaryMin
      ? Number(req.query.salaryMin)
      : undefined;
    const salaryMax = req.query.salaryMax
      ? Number(req.query.salaryMax)
      : undefined;
    const expMin = req.query.expMin ? Number(req.query.expMin) : undefined;
    const expMax = req.query.expMax ? Number(req.query.expMax) : undefined;

    let query = supabase
      .from("job_posting")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    // Basic text search on a few columns
    if (search) {
      // Use ilike for case-insensitive matching
      query = query.or(
        `position_name.ilike.%${search}%,job_description.ilike.%${search}%,requirements.ilike.%${search}%`
      );
    }

    if (location) {
      // If you have a location column, filter here. Adjust column name if different
      query = query.ilike("working_time", `%${location}%`);
    }

    // Pre-filter by simple numeric ranges when provided
    if (typeof salaryMin === "number") query = query.gte("salary", salaryMin);
    if (typeof salaryMax === "number") query = query.lte("salary", salaryMax);
    if (typeof expMin === "number")
      query = query.gte("experience_years", expMin);
    if (typeof expMax === "number")
      query = query.lte("experience_years", expMax);

    // If workTypes provided, find matching job_posting_ids via work_type table
    if (workTypes.length > 0) {
      const { data: wtRows, error: wtErr } = await supabase
        .from("work_type")
        .select("job_posting_id")
        .in("work_type_name", workTypes);
      if (wtErr) {
        console.error("Supabase error (work_type):", wtErr);
      } else if (wtRows && wtRows.length > 0) {
        const ids = Array.from(new Set(wtRows.map((r) => r.job_posting_id)));
        query = query.in("job_posting_id", ids);
      } else {
        // No matches
        return res.json({ page, limit, total: 0, jobs: [] });
      }
    }

    // If industries provided, map to company_ids via company_industry and filter
    if (industryNames.length > 0) {
      const { data: inds } = await supabase
        .from("industry")
        .select("industry_id, name")
        .in("name", industryNames);
      const industryIds = (inds || []).map((i) => i.industry_id);
      if (industryIds.length > 0) {
        const { data: ci } = await supabase
          .from("company_industry")
          .select("company_id, industry_id")
          .in("industry_id", industryIds);
        const companyIds = Array.from(
          new Set((ci || []).map((r) => r.company_id))
        );
        if (companyIds.length > 0) {
          query = query.in("company_id", companyIds);
        } else {
          return res.json({ page, limit, total: 0, jobs: [] });
        }
      }
    }

    const { data, error, count } = await query;
    if (error) {
      console.error("Supabase error:", error);
      return res
        .status(500)
        .json({ message: "Failed to fetch jobs", error: error.message });
    }

    // Enrich with company name and address
    let jobs = data || [];
    if (jobs.length > 0) {
      const companyIds = Array.from(
        new Set(jobs.map((j) => j.company_id).filter(Boolean))
      );
      const jobIds = Array.from(new Set(jobs.map((j) => j.job_posting_id)));
      if (companyIds.length > 0) {
        const [companyRes, addressRes, ciRes, indRes, workTypeRes] =
          await Promise.all([
            supabase.from("company").select("company_id, name"),
            supabase.from("address").select("company_id, address_detail"),
            supabase
              .from("company_industry")
              .select("company_id, industry_id")
              .in("company_id", companyIds),
            supabase.from("industry").select("industry_id, name"),
            supabase
              .from("work_type")
              .select("job_posting_id, work_type_name")
              .in("job_posting_id", jobIds),
          ]);

        const companies = companyRes.data || [];
        const addresses = addressRes.data || [];
        const companyIndustries = ciRes.data || [];
        const industries = indRes.data || [];
        const workTypes = workTypeRes.data || [];

        const companyMap = new Map(
          companies.map((c) => [c.company_id, c.name])
        );
        const addressMap = new Map(
          addresses.map((a) => [a.company_id, a.address_detail])
        );
        const industryMap = new Map(
          industries.map((i) => [i.industry_id, i.name])
        );
        const companyIdToIndustryNames = new Map();
        companyIndustries.forEach((row) => {
          const name = industryMap.get(row.industry_id);
          if (!name) return;
          const list = companyIdToIndustryNames.get(row.company_id) || [];
          if (!list.includes(name)) list.push(name);
          companyIdToIndustryNames.set(row.company_id, list);
        });

        const jobIdToWorkTypes = new Map();
        workTypes.forEach((row) => {
          const list = jobIdToWorkTypes.get(row.job_posting_id) || [];
          if (!list.includes(row.work_type_name)) list.push(row.work_type_name);
          jobIdToWorkTypes.set(row.job_posting_id, list);
        });

        jobs = jobs.map((j) => ({
          ...j,
          company_name: companyMap.get(j.company_id) || null,
          address_detail: addressMap.get(j.company_id) || null,
          industries: companyIdToIndustryNames.get(j.company_id) || [],
          work_types: jobIdToWorkTypes.get(j.job_posting_id) || [],
        }));
      }
    }

    return res.json({
      page,
      limit,
      total: count || 0,
      jobs,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Unexpected error", error: err.message });
  }
}

// GET /api/jobs/:id
async function getJobById(req, res) {
  try {
    const id = req.params.id;
    console.log("[GET] /api/jobs/:id", id);
    const { data: job, error: jobErr } = await supabase
      .from("job_posting")
      .select("*")
      .eq("job_posting_id", id)
      .single();

    if (jobErr || !job) {
      if (jobErr) console.error("Supabase error:", jobErr);
      return res.status(404).json({ message: "Job not found" });
    }

    // Fetch company info
    let company = null;
    if (job.company_id) {
      const { data: companyData, error: companyErr } = await supabase
        .from("company")
        .select("company_id, name, description, size, website")
        .eq("company_id", job.company_id)
        .single();
      if (!companyErr) company = companyData;
    }

    // Fetch company address
    let addressDetail = null;
    if (job.company_id) {
      const { data: addressRow } = await supabase
        .from("address")
        .select("address_detail")
        .eq("company_id", job.company_id)
        .limit(1)
        .single();
      if (addressRow && addressRow.address_detail)
        addressDetail = addressRow.address_detail;
    }

    // Fetch skills via pivot
    const { data: pivotSkills } = await supabase
      .from("job_posting_skill")
      .select("skill_id")
      .eq("job_posting_id", id);
    let skills = [];
    if (pivotSkills && pivotSkills.length > 0) {
      const skillIds = pivotSkills.map((s) => s.skill_id);
      const { data: skillRows } = await supabase
        .from("skill")
        .select("skill_id, name")
        .in("skill_id", skillIds);
      skills = (skillRows || []).map((r) => r.name).filter(Boolean);
    }

    // Fetch industries via pivot (optional)
    const { data: pivotIndustries } = await supabase
      .from("job_posting_industry")
      .select("industry_id")
      .eq("job_posting_id", id);
    let industries = [];
    if (pivotIndustries && pivotIndustries.length > 0) {
      const indIds = pivotIndustries.map((r) => r.industry_id);
      const { data: indRows } = await supabase
        .from("industry")
        .select("industry_id, name")
        .in("industry_id", indIds);
      industries = (indRows || []).map((r) => r.name).filter(Boolean);
    }

    // Fetch work types for this job
    let workTypes = [];
    const { data: wtRows } = await supabase
      .from("work_type")
      .select("work_type_name")
      .eq("job_posting_id", id);
    if (Array.isArray(wtRows)) {
      workTypes = wtRows.map((w) => w.work_type_name).filter(Boolean);
    }

    // Shape a frontend-friendly response (non-breaking: also include original job fields)
    const response = {
      ...job,
      company,
      company_name: company?.name || null,
      address_detail: addressDetail,
      skills,
      industries,
      work_types: workTypes,
      requirements_list: job.requirements
        ? String(job.requirements)
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      benefits_list: job.benefits
        ? String(job.benefits)
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };

    return res.json(response);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res
      .status(500)
      .json({ message: "Unexpected error", error: err.message });
  }
}

// GET /api/filters
async function getFilters(req, res) {
  try {
    const [{ data: wt, error: wtErr }, { data: ind, error: indErr }] =
      await Promise.all([
        supabase.from("work_type").select("work_type_name"),
        supabase.from("industry").select("name"),
      ]);

    if (wtErr || indErr) {
      const err = wtErr || indErr;
      console.error("Supabase error (filters):", err);
      return res
        .status(500)
        .json({ message: "Failed to load filters", error: err.message });
    }

    const workTypes = Array.from(
      new Set((wt || []).map((w) => w.work_type_name))
    ).filter(Boolean);

    const industries = Array.from(
      new Set((ind || []).map((i) => i.name))
    ).filter(Boolean);

    return res.json({ workTypes, industries });
  } catch (e) {
    console.error("Unexpected error (filters):", e);
    return res
      .status(500)
      .json({ message: "Failed to load filters", error: e.message });
  }
}

module.exports = {
  getJobs,
  getJobById,
  getFilters,
};
