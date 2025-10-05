import { useEffect, useState } from "react";
import { listCompany } from "../../services/company";
import JobApplication from "../jobApplicaton/jobApplication";

function Company() {
  const [companys, setCompany] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const dataCompany = await listCompany();
      if (dataCompany.success) {
        setCompany(dataCompany.companys || []); // ✅ dùng companys
      }
    };
    fetchData();
  }, []);
  return (
    <>
      <h2>Danh sách công ty</h2>
      <ul>
        {companys.map((company) => (
          <li key={company.company_id}>
            <strong>{company.name}</strong> — {company.description}
            <strong>{company.size}</strong> — {company.website}
          </li>
        ))}
      </ul>

      <JobApplication />
    </>
  );
}
export default Company;
