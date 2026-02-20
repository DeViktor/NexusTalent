import { vacancies as initialJobs } from './vacancies';
import type { JobPosting } from './types';

// In-memory store for jobs
let jobs: JobPosting[] = [...initialJobs];

const toDate = (date: string | Date | undefined): Date | null => {
    if (!date) return null;
    if (typeof date === 'string') return new Date(date);
    return date instanceof Date ? date : null;
}

// Function to get all jobs, with an option to include expired ones
export const getJobs = (includeExpired: boolean = false): JobPosting[] => {
    const now = new Date();
    
    const allJobs = [...jobs].sort((a, b) => {
        const dateA = toDate(a.postedDate);
        const dateB = toDate(b.postedDate);
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
    });

    if (includeExpired) {
        return allJobs;
    }

    // Default behavior for public view: return only active jobs
    return allJobs.filter(v => {
        const closingDate = toDate(v.closingDate);
        // If no closing date, it's considered active
        return !closingDate || closingDate >= now;
    });
};

// Function to find a single job by ID
export const getJobById = (id: string): JobPosting | undefined => {
    return jobs.find(v => v.id === id);
};

// Function to add a new job
export const addJob = (jobData: Omit<JobPosting, 'id' | 'postedDate'>): JobPosting => {
    const newJob: JobPosting = {
        ...jobData,
        id: `job-${new Date().getTime()}`,
        postedDate: new Date(),
    };

    const existingIndex = jobs.findIndex(v => v.id === newJob.id);
    if (existingIndex !== -1) {
        // This case should be rare with timestamp-based IDs, but as a safeguard
        jobs[existingIndex] = newJob;
    } else {
        jobs.unshift(newJob);
    }
    
    return newJob;
};


// Function to update an existing job
export const updateJob = (id: string, updatedData: Partial<Omit<JobPosting, 'id' | 'postedDate'>>): JobPosting | null => {
    const jobIndex = jobs.findIndex(v => v.id === id);
    if (jobIndex === -1) {
        return null; // JobPosting not found
    }

    const updatedJob = {
        ...jobs[jobIndex],
        ...updatedData,
    };
    
    jobs[jobIndex] = updatedJob;
    
    return updatedJob;
}

// Function to delete a job
export const deleteJob = (id: string): void => {
    jobs = jobs.filter(v => v.id !== id);
};

export const getVacancies = getJobs;
export const getVacancyById = getJobById;
export const addVacancy = addJob;
export const updateVacancy = updateJob;
export const deleteVacancy = deleteJob;
