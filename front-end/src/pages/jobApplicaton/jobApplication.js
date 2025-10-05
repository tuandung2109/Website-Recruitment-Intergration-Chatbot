import { useEffect, useState } from "react";
import { listJobApplication } from "../../services/jobApplication";

function JobApplication() {
  const [jobApplications, setJobApplications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const dataJobApplication = await listJobApplication();
      if (dataJobApplication.success) {
        setJobApplications(dataJobApplication.jobApplications || []);
      }
    };
    fetchData();
  }, []);
  return (
    <>
      <h2>Danh sách công ty cover_letter</h2>
      <ul>
        {jobApplications.map((jobApplication) => (
          <li key={jobApplication.job_application_id}>
            <strong>{jobApplication.name}</strong> —{" "}
            {jobApplication.cover_letter}
          </li>
        ))}
      </ul>
    </>
  );
}
export default JobApplication;
