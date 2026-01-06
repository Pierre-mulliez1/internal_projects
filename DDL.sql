-- 1. use the Database
CREATE DATABASE IF NOT EXISTS internal_projects;
USE internal_projects;

-- 2. Create the Projects Table
-- Stores the high-level project information (e.g., Ask!, Smart Factory)
CREATE TABLE IF NOT EXISTS Projects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    entity VARCHAR(100) DEFAULT NULL, -- e.g., 'DataDriven', 'Data Driven x Cyber'
    subtitle VARCHAR(255),
    description TEXT, -- Longer description if needed
    hero_image_url VARCHAR(2083), -- Standard max length for URLs
    demo_link VARCHAR(2083),
    doc_link VARCHAR(2083),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Create the Recruiters Table
-- Stores recruiter details to avoid repeating emails in the Jobs table
CREATE TABLE IF NOT EXISTS Recruiters (
    recruiter_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create the Jobs (Open Roles) Table
-- Stores the specific job openings. 
-- 'project_id' is a Foreign Key linking the job to a specific project.
-- 'recruiter_id' is a Foreign Key linking to the contact person.
CREATE TABLE IF NOT EXISTS Jobs (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL, -- e.g., 'Cloud Engineer', 'Full Stack Developer'
    location VARCHAR(100) NOT NULL, -- e.g., 'Paris, France', 'Remote'
    department VARCHAR(100), -- e.g., 'Cloud & DevOps Division'
    description TEXT NOT NULL,
    image_url VARCHAR(2083),
    project_id INT, -- FK to Projects
    recruiter_id INT, -- FK to Recruiters
    is_active BOOLEAN DEFAULT TRUE, -- To easily hide filled positions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE SET NULL,
    FOREIGN KEY (recruiter_id) REFERENCES Recruiters(recruiter_id) ON DELETE SET NULL
);

-- 5. Create the Skills Table
-- Stores unique skills/specifications 
CREATE TABLE IF NOT EXISTS Skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(50) NOT NULL UNIQUE
);

-- 6. Create the Job_Skills Bridge Table
-- Manages the Many-to-Many relationship: One Job can require many Skills.
CREATE TABLE IF NOT EXISTS Job_Skills (
    job_id INT,
    skill_id INT,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id) REFERENCES Jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id) ON DELETE CASCADE
);

-- 7. Create the Project_Features Table 
-- To store the bullet points (features) for each project dynamically
CREATE TABLE IF NOT EXISTS Project_Features (
    feature_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    title VARCHAR(100) NOT NULL, -- e.g., 'Productivity Gain'
    description TEXT NOT NULL,
    icon_code VARCHAR(50), -- To store the icon identifier if needed
    FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE
);

-- ==========================================
-- Contacts Table
-- ==========================================
-- Stores stakeholders who are not necessarily recruiters (e.g., Project Managers, Tech Leads)
CREATE TABLE IF NOT EXISTS Contacts (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(100), -- e.g., 'Project Manager', 'Lead Developer'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Chat Table (Bridge: Contacts <-> Projects)
-- ==========================================
-- Many-to-Many: A Contact can be involved in many Projects, 
-- and a Project can have many Contacts (Points of Contact).
CREATE TABLE IF NOT EXISTS Chat (
    chat_id INT AUTO_INCREMENT PRIMARY KEY, -- Optional surrogate key if you want to track specific conversation threads
    contact_id INT NOT NULL,
    project_id INT NOT NULL,
    topic VARCHAR(255) DEFAULT 'General', -- Context for this link (e.g., 'Technical Lead', 'Business Owner')
    
    FOREIGN KEY (contact_id) REFERENCES Contacts(contact_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE
);

-- ==========================================
--  Reviews Table (Update Requests)
-- ==========================================
-- Stores the actual request to update a project or mission.
CREATE TABLE IF NOT EXISTS Reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    requestor_email VARCHAR(255) NOT NULL, -- Who asked for the update
    request_type ENUM('Content Update', 'New Feature', 'Bug Fix', 'Decommission') NOT NULL,
    status ENUM('Pending', 'In Progress', 'Approved', 'Rejected') DEFAULT 'Pending',
    comments TEXT, -- Details of what needs to be changed
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================
-- project_validation Table (Bridge: Reviews <-> Projects)
-- ==========================================
-- Links an Update Request (Review) to one or more Projects.
CREATE TABLE IF NOT EXISTS project_validation (
    review_id INT,
    project_id INT,
    
    PRIMARY KEY (review_id, project_id),
    FOREIGN KEY (review_id) REFERENCES Reviews(review_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE
);

-- ==========================================
-- review_validation Table (Bridge: Reviews <-> Jobs/Missions)
-- ==========================================
-- Links an Update Request (Review) to one or more Jobs (Missions).
-- Note: 'Jobs' table represents the 'Missions'.
CREATE TABLE IF NOT EXISTS review_validation (
    review_id INT,
    job_id INT,
    
    PRIMARY KEY (review_id, job_id),
    FOREIGN KEY (review_id) REFERENCES Reviews(review_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs(job_id) ON DELETE CASCADE
);