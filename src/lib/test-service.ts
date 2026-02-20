import { tests as initialTests } from './tests';
import type { AssessmentTest } from './types';

// In-memory store for tests, acting as a cache for localStorage
let tests: AssessmentTest[] | null = null;
const TESTS_STORAGE_KEY = 'nexus-talent-tests';

const loadTests = (): AssessmentTest[] => {
    // If cache is populated, return it
    if (tests) {
        return tests;
    }

    // If running on server, return initial data
    if (typeof window === 'undefined') {
        return initialTests;
    }
    
    try {
        const storedTests = localStorage.getItem(TESTS_STORAGE_KEY);
        if (storedTests) {
            // Parse stored data and populate cache
            tests = JSON.parse(storedTests);
            return tests!;
        } else {
            // No stored data, use initial data and populate cache
            tests = [...initialTests];
            localStorage.setItem(TESTS_STORAGE_KEY, JSON.stringify(tests));
            return tests;
        }
    } catch (error) {
        console.error("Failed to load tests from localStorage, using initial data:", error);
        // On error, fallback to initial data
        tests = [...initialTests];
        return tests;
    }
};

const saveTests = (newTests: AssessmentTest[]): void => {
    tests = newTests;
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(TESTS_STORAGE_KEY, JSON.stringify(newTests));
        } catch (error) {
            console.error("Failed to save tests to localStorage:", error);
        }
    }
};

// Function to get all tests for a specific job
export const getTestsForJob = (jobId: string): AssessmentTest[] => {
    const allTests = loadTests();
    return allTests.filter(t => t.jobId === jobId);
};

// Function to find a single test by ID
export const getTestById = (id: string): AssessmentTest | undefined => {
    const allTests = loadTests();
    return allTests.find(t => t.id === id);
};

// Function to add a new test
export const addTest = (testData: AssessmentTest): AssessmentTest => {
    const currentTests = loadTests();
    
    if (currentTests.some(t => t.id === testData.id)) {
        throw new Error(`Um teste com o ID '${testData.id}' já existe.`);
    }

    const newTests = [testData, ...currentTests];
    saveTests(newTests);
    
    return testData;
};

// Function to delete a test
export const deleteTest = (id: string): void => {
    const currentTests = loadTests();
    const newTests = currentTests.filter(t => t.id !== id);
    saveTests(newTests);
};

export const getTestsForVacancy = getTestsForJob;
