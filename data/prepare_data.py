"""
Data Preparation Module
=======================
Generates synthetic resume data and job descriptions for training
and evaluation of the resume screening system.
"""

import random
import json
import os
import numpy as np
import pandas as pd


# ---- Skill pools by job category ----
JOB_SKILL_POOLS = {
    "software_engineer": {
        "title": "Software Engineer",
        "required": ["python", "java", "sql", "git", "data structures"],
        "preferred": ["docker", "kubernetes", "aws", "react", "node.js",
                       "agile", "ci/cd", "mongodb", "postgresql", "typescript"],
        "min_experience": 2,
        "min_education": "bachelor",
    },
    "data_scientist": {
        "title": "Data Scientist",
        "required": ["python", "machine learning", "statistics", "sql",
                     "data analysis"],
        "preferred": ["tensorflow", "pytorch", "pandas", "numpy",
                       "data visualization", "deep learning", "nlp",
                       "scikit-learn", "r", "spark"],
        "min_experience": 1,
        "min_education": "master",
    },
    "web_developer": {
        "title": "Web Developer",
        "required": ["javascript", "html", "css", "react", "node.js"],
        "preferred": ["typescript", "vue", "angular", "mongodb", "postgresql",
                       "docker", "aws", "agile", "git", "next.js"],
        "min_experience": 1,
        "min_education": "bachelor",
    },
    "devops_engineer": {
        "title": "DevOps Engineer",
        "required": ["docker", "kubernetes", "aws", "ci/cd", "linux"],
        "preferred": ["terraform", "ansible", "jenkins", "python", "bash",
                       "azure", "gcp", "monitoring", "git", "agile"],
        "min_experience": 3,
        "min_education": "bachelor",
    },
    "ml_engineer": {
        "title": "Machine Learning Engineer",
        "required": ["python", "machine learning", "deep learning",
                     "tensorflow", "sql"],
        "preferred": ["pytorch", "kubernetes", "docker", "nlp",
                       "computer vision", "aws", "spark", "data pipeline",
                       "scikit-learn", "numpy"],
        "min_experience": 2,
        "min_education": "master",
    },
}

# Name pools for synthetic data
FIRST_NAMES = [
    "James", "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia",
    "Mason", "Isabella", "Aiden", "Mia", "Lucas", "Charlotte", "Jackson",
    "Amelia", "Logan", "Harper", "Alexander", "Evelyn", "Raj", "Priya",
    "Wei", "Mei", "Omar", "Fatima", "Carlos", "Maria", "Yuki", "Hiroshi",
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Patel", "Shah", "Chen", "Wang",
    "Kim", "Singh", "Kumar", "Ali", "Nguyen", "Tanaka", "Mueller",
    "Anderson", "Taylor", "Thomas", "Jackson", "White", "Harris", "Clark",
]

UNIVERSITIES = [
    "MIT", "Stanford University", "University of Toronto",
    "University of Waterloo", "Carnegie Mellon University",
    "Georgia Tech", "UC Berkeley", "University of Windsor",
    "University of Michigan", "University of British Columbia",
    "Harvard University", "Oxford University",
    "National University of Singapore", "IIT Delhi",
]

COMPANIES = [
    "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix",
    "Shopify", "IBM", "Oracle", "Salesforce", "Uber", "Airbnb",
    "Stripe", "Datadog", "Snowflake", "Databricks", "TechStartup Inc.",
    "Local Software Co.", "Freelance", "Accenture", "Deloitte",
]


def generate_resume_text(job_category, quality="good"):
    """
    Generate a synthetic resume text.

    Args:
        job_category: Key from JOB_SKILL_POOLS.
        quality: "good" (accept), "average" (borderline), or "poor" (reject).

    Returns:
        str: Synthetic resume text.
    """
    pool = JOB_SKILL_POOLS[job_category]
    name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
    email = f"{name.lower().replace(' ', '.')}@email.com"
    phone = f"({random.randint(200,999)}) {random.randint(100,999)}-{random.randint(1000,9999)}"

    if quality == "good":
        num_required = len(pool["required"])
        num_preferred = random.randint(3, len(pool["preferred"]))
        experience = random.randint(
            pool["min_experience"] + 1, pool["min_experience"] + 8
        )
        education = random.choice(["Master", "Bachelor", "Ph.D"])
    elif quality == "average":
        num_required = random.randint(
            len(pool["required"]) // 2, len(pool["required"])
        )
        num_preferred = random.randint(1, 3)
        experience = pool["min_experience"]
        education = "Bachelor"
    else:  # poor
        num_required = random.randint(0, len(pool["required"]) // 2)
        num_preferred = random.randint(0, 1)
        experience = random.randint(0, max(0, pool["min_experience"] - 1))
        education = random.choice(["Bachelor", "High School", "Associate"])

    # Pick skills
    required_skills = random.sample(pool["required"], min(num_required, len(pool["required"])))
    preferred_skills = random.sample(pool["preferred"], min(num_preferred, len(pool["preferred"])))
    all_skills = list(set(required_skills + preferred_skills))

    # Generate resume text
    university = random.choice(UNIVERSITIES)
    company = random.choice(COMPANIES)
    start_year = 2024 - experience
    end = random.choice(["Present", "2024"])

    resume = f"""{name}
{email} | {phone}
linkedin.com/in/{name.lower().replace(' ', '-')}

SUMMARY
Experienced professional with {experience} years of experience in {pool['title'].lower()} roles.
Passionate about building scalable solutions and driving impact through technology.

EDUCATION
{education} of Science in Computer Science
{university}, {start_year - 4} - {start_year}

EXPERIENCE
{pool['title']} at {company}
{start_year} - {end}
- Developed and maintained software applications using {', '.join(all_skills[:3])}
- Collaborated with cross-functional teams in agile environment
- Improved system performance and code quality
{"- Led a team of " + str(random.randint(3,10)) + " engineers on key projects" if quality == "good" else ""}
{"- Implemented CI/CD pipelines and automated testing" if "ci/cd" in all_skills else ""}

{"Junior Developer at " + random.choice(COMPANIES) if experience > 3 else ""}
{"2019 - " + str(start_year) if experience > 3 else ""}
{"- Assisted with feature development and bug fixes" if experience > 3 else ""}
{"- Gained foundational skills in " + ', '.join(all_skills[3:6]) if experience > 3 else ""}

SKILLS
Technical Skills: {', '.join(all_skills)}

CERTIFICATIONS
{"AWS Certified Solutions Architect" if "aws" in all_skills else ""}
{"Google Cloud Professional" if "gcp" in all_skills else ""}
{"Certified Kubernetes Administrator" if "kubernetes" in all_skills else ""}
"""
    return resume.strip()


def generate_dataset(num_samples=600, output_dir="data"):
    """
    Generate a complete synthetic dataset for training.

    Args:
        num_samples: Total number of resumes to generate.
        output_dir: Directory to save the dataset.

    Returns:
        pd.DataFrame: Generated dataset.
    """
    os.makedirs(output_dir, exist_ok=True)

    data = []
    categories = list(JOB_SKILL_POOLS.keys())
    samples_per_category = num_samples // len(categories)

    for category in categories:
        # 40% good (accept), 30% average (borderline), 30% poor (reject)
        for _ in range(int(samples_per_category * 0.4)):
            text = generate_resume_text(category, "good")
            data.append({
                "resume_text": text,
                "job_category": category,
                "quality": "good",
                "label": 1,  # Accept
            })

        for _ in range(int(samples_per_category * 0.3)):
            text = generate_resume_text(category, "average")
            data.append({
                "resume_text": text,
                "job_category": category,
                "quality": "average",
                "label": 1,  # Accept (borderline but still meets minimum)
            })

        for _ in range(int(samples_per_category * 0.3)):
            text = generate_resume_text(category, "poor")
            data.append({
                "resume_text": text,
                "job_category": category,
                "quality": "poor",
                "label": 0,  # Reject
            })

    df = pd.DataFrame(data)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    # Save dataset
    df.to_csv(os.path.join(output_dir, "resumes_dataset.csv"), index=False)

    # Save job descriptions
    job_descriptions = {}
    for key, pool in JOB_SKILL_POOLS.items():
        job_descriptions[key] = {
            "title": pool["title"],
            "required_skills": pool["required"],
            "preferred_skills": pool["preferred"],
            "min_experience": pool["min_experience"],
            "min_education": pool["min_education"],
            "description": (
                f"We are looking for a {pool['title']} with at least "
                f"{pool['min_experience']} years of experience. "
                f"Required skills: {', '.join(pool['required'])}. "
                f"Preferred: {', '.join(pool['preferred'][:5])}. "
                f"Minimum education: {pool['min_education'].title()} degree."
            ),
        }

    with open(os.path.join(output_dir, "job_descriptions.json"), "w") as f:
        json.dump(job_descriptions, f, indent=2)

    print(f"Generated {len(df)} resumes across {len(categories)} categories")
    print(f"Label distribution:\n{df['label'].value_counts()}")
    print(f"Saved to {output_dir}/")

    return df


if __name__ == "__main__":
    generate_dataset(num_samples=600)
