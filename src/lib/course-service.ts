
import { courses as initialCourses } from './courses';
import { courseCategories as allCourseCategories } from './courses';
import type { Course, CourseCategory, CourseStatus } from './types';

// In-memory store for courses. Starts with the initial data.
let courses: Course[] = [...initialCourses];


// Function to get all courses
export const getCourses = (includePendingAndInactive: boolean = false): Course[] => {
    if (includePendingAndInactive) {
        // Return all courses for admin/instructor views
        return [...courses].sort((a, b) => a.name.localeCompare(b.name));
    }
    // Default behavior for public view: return only active courses
    return courses.filter(c => c.status === 'Ativo').sort((a, b) => a.name.localeCompare(b.name));
};

// Function to get all course categories
export const getCourseCategories = (): CourseCategory[] => {
    return [...allCourseCategories];
};

// Function to find a single course by ID
export const getCourseById = (id: string): Course | undefined => {
    return courses.find(c => c.id === id);
};

// Function to add a new course
export const addCourse = (courseData: Omit<Course, 'status'>): Course => {
    if (courses.some(c => c.id === courseData.id)) {
        throw new Error(`Um curso com o ID '${courseData.id}' já existe.`);
    }

    const newCourse: Course = {
        ...courseData,
        status: 'Pendente', // New courses are pending approval
    };

    // Add to the start of the array
    courses.unshift(newCourse);
    
    return newCourse;
};


// Function to update an existing course
export const updateCourse = (id: string, updatedData: Partial<Course>): Course | null => {
    const courseIndex = courses.findIndex(c => c.id === id);
    if (courseIndex === -1) {
        return null; // Course not found
    }

    const updatedCourse: Course = {
        ...courses[courseIndex],
        ...updatedData,
        id: id // ensure id is not lost
    };
    
    courses[courseIndex] = updatedCourse;
    
    return updatedCourse;
}

export const updateCourseStatus = (id: string, status: CourseStatus): Course | null => {
    return updateCourse(id, { status });
}

// Function to delete a course
export const deleteCourse = (id: string): void => {
    const initialLength = courses.length;
    courses = courses.filter(c => c.id !== id);
    if (courses.length === initialLength) {
        throw new Error(`Curso com ID '${id}' não encontrado.`);
    }
};
