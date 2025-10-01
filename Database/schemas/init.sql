
-- ================================
-- PostgreSQL Database Schema Script
-- Generated from ERD + Specifications
-- ================================

-- 1. account_type
CREATE TABLE account_type (
    account_type_id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL
);

-- 2. account
CREATE TABLE account (
    account_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    gender VARCHAR(10),
    date_of_birth DATE,
    phone_number VARCHAR(11),
    company_id INT,
    int money_balance,
    CONSTRAINT fk_account_company FOREIGN KEY (company_id) REFERENCES company(company_id)
);

-- 3. account_account_type
CREATE TABLE account_account_type (
    account_id INT NOT NULL,
    account_type_id INT NOT NULL,
    PRIMARY KEY (account_id, account_type_id),
    CONSTRAINT fk_a_at_account FOREIGN KEY (account_id) REFERENCES account(account_id),
    CONSTRAINT fk_a_at_account_type FOREIGN KEY (account_type_id) REFERENCES account_type(account_type_id)
);

-- 4. company
CREATE TABLE company (
    company_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry_id INT NOT NULL,
    website VARCHAR(255),
    logo_url TEXT NOT NULL,
    size VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    CONSTRAINT fk_company_industry FOREIGN KEY (industry_id) REFERENCES industry(industry_id)
);

-- 5. industry
CREATE TABLE industry (
    industry_id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- 6. company_industry
CREATE TABLE company_industry (
    company_id INT NOT NULL,
    industry_id INT NOT NULL,
    PRIMARY KEY (company_id, industry_id),
    CONSTRAINT fk_ci_company FOREIGN KEY (company_id) REFERENCES company(company_id),
    CONSTRAINT fk_ci_industry FOREIGN KEY (industry_id) REFERENCES industry(industry_id)
);

-- 7. job_posting
CREATE TABLE job_posting (
    job_posting_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL,
    company_id INT NOT NULL,
    industry_id INT NOT NULL,
    position_name VARCHAR(255) NOT NULL,
    job_description TEXT,
    requirements TEXT,
    salary VARCHAR(100),
    work_type VARCHAR(50),
    deadline DATE,
    skills TEXT,
    experience_years INT,
    education_level VARCHAR(100),
    benefits TEXT,
    working_time VARCHAR(100),
    CONSTRAINT fk_jp_account FOREIGN KEY (account_id) REFERENCES account(account_id),
    CONSTRAINT fk_jp_company FOREIGN KEY (company_id) REFERENCES company(company_id),
    CONSTRAINT fk_jp_industry FOREIGN KEY (industry_id) REFERENCES industry(industry_id)
);

-- 8. job_posting_industry
CREATE TABLE job_posting_industry (
    job_posting_id INT NOT NULL,
    industry_id INT NOT NULL,
    PRIMARY KEY (job_posting_id, industry_id),
    CONSTRAINT fk_jpi_job_posting FOREIGN KEY (job_posting_id) REFERENCES job_posting(job_posting_id),
    CONSTRAINT fk_jpi_industry FOREIGN KEY (industry_id) REFERENCES industry(industry_id)
);

-- 9. job_application
CREATE TABLE job_application (
    job_application_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL,
    job_posting_id INT NOT NULL,
    cv_id INT NOT NULL,
    cover_letter TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    file_upload VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    CONSTRAINT fk_ja_account FOREIGN KEY (account_id) REFERENCES account(account_id),
    CONSTRAINT fk_ja_job_posting FOREIGN KEY (job_posting_id) REFERENCES job_posting(job_posting_id),
    CONSTRAINT fk_ja_cv FOREIGN KEY (cv_id) REFERENCES cv(cv_id)
);

-- 10. cv
CREATE TABLE cv (
    cv_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL,
    cv_link TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    years_experience INT CHECK (years_experience >= 0),
    education_level VARCHAR(100),
    CONSTRAINT fk_cv_account FOREIGN KEY (account_id) REFERENCES account(account_id)
);

-- 11. skill
CREATE TABLE skill (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL
);

-- 12. cv_skill
CREATE TABLE cv_skill (
    cv_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (cv_id, skill_id),
    CONSTRAINT fk_cvs_cv FOREIGN KEY (cv_id) REFERENCES cv(cv_id),
    CONSTRAINT fk_cvs_skill FOREIGN KEY (skill_id) REFERENCES skill(skill_id)
);

-- 13. job_posting_skill
CREATE TABLE job_posting_skill (
    job_posting_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (job_posting_id, skill_id),
    CONSTRAINT fk_jps_job_posting FOREIGN KEY (job_posting_id) REFERENCES job_posting(job_posting_id),
    CONSTRAINT fk_jps_skill FOREIGN KEY (skill_id) REFERENCES skill(skill_id)
);

-- 14. invoice
CREATE TABLE invoice (
    invoice_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL,
    card_number VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL CHECK (amount >= 10000),
    bank_name VARCHAR(100) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_invoice_account FOREIGN KEY (account_id) REFERENCES account(account_id)
);

-- 15. message
CREATE TABLE message (
    message_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL,
    message_account TEXT NOT NULL,
    message_ai TEXT NOT NULL,
    CONSTRAINT fk_message_account FOREIGN KEY (account_id) REFERENCES account(account_id)
);

-- 16. user_guide
CREATE TABLE user_guide (
    guide_id SERIAL PRIMARY KEY,
    guide_title TEXT NOT NULL,
    guide_content TEXT NOT NULL,
    update_at DATE NOT NULL
);

-- 17. contact_info
CREATE TABLE contact_info (
    contact_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL,
    contact_detail VARCHAR(255) NOT NULL,
    CONSTRAINT fk_contact_account FOREIGN KEY (account_id) REFERENCES account(account_id)
);

-- 18. work_type
CREATE TABLE work_type (
    work_type_id SERIAL PRIMARY KEY,
    job_posting_id INT NOT NULL,
    work_type_name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_worktype_jobposting FOREIGN KEY (job_posting_id) REFERENCES job_posting(job_posting_id)
);

-- 19. address
CREATE TABLE address (
    address_id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    address_detail VARCHAR(255) NOT NULL,
    CONSTRAINT fk_address_company FOREIGN KEY (company_id) REFERENCES company(company_id)
);
