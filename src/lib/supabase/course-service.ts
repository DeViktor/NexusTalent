
import { supabase } from './client';
import type { Course, CourseCategory } from '@/lib/types';

// Tipos para inserção/atualização (omitindo campos gerados pelo banco)
export type CourseInsert = Omit<Course, 'createdAt' | 'updatedAt'>;
export type CourseUpdate = Partial<CourseInsert>;

export async function getCourses(includePendingAndInactive: boolean = false): Promise<Course[]> {
  let query = supabase
    .from('courses')
    .select(`
      *,
      category:course_categories(id, name)
    `);
    
  if (!includePendingAndInactive) {
    query = query.eq('status', 'Ativo');
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching courses:', error);
    return [];
  }

  return data.map(mapDatabaseCourseToCourse);
}

export async function getCourseById(id: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      category:course_categories(id, name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching course ${id}:`, error);
    return null;
  }

  return mapDatabaseCourseToCourse(data);
}

export async function createCourse(course: CourseInsert): Promise<Course | null> {
  const dbCourse = mapCourseToDatabaseCourse(course);
  
  const { data, error } = await supabase
    .from('courses')
    .insert(dbCourse)
    .select()
    .single();

  if (error) {
    console.error('Error creating course:', error);
    return null;
  }

  return mapDatabaseCourseToCourse(data);
}

export async function updateCourse(id: string, updates: CourseUpdate): Promise<Course | null> {
  const dbUpdates = mapCourseToDatabaseCourse(updates);

  const { data, error } = await supabase
    .from('courses')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating course ${id}:`, error);
    return null;
  }

  return mapDatabaseCourseToCourse(data);
}

export async function deleteCourse(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting course ${id}:`, error);
    return false;
  }

  return true;
}

export async function getCourseCategories(): Promise<CourseCategory[]> {
  const { data, error } = await supabase
    .from('course_categories')
    .select('*');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data;
}

export async function getPurchasedCourses(userId: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from('purchased_courses')
    .select('course_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching purchased courses:', error);
    return [];
  }

  const courseIds = (Array.isArray(data) ? data : [])
    .map((item: any) => String(item?.course_id ?? '').trim())
    .filter((id: string) => id.length > 0);

  if (courseIds.length === 0) {
    return [];
  }

  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select(`
      *,
      category:course_categories(id, name)
    `)
    .in('id', courseIds);

  if (coursesError) {
    console.error('Error fetching purchased course details:', coursesError);
    return [];
  }

  const order = new Map(courseIds.map((id, index) => [id, index]));
  return (Array.isArray(coursesData) ? coursesData : [])
    .sort((a: any, b: any) => (order.get(String(a.id)) ?? 0) - (order.get(String(b.id)) ?? 0))
    .map(mapDatabaseCourseToCourse);
}

// Helpers para mapear entre snake_case (banco) e camelCase (app)

function mapDatabaseCourseToCourse(dbCourse: any): Course {
  return {
    id: dbCourse.id,
    name: dbCourse.name,
    category: dbCourse.category?.id || dbCourse.category, // Handle join or raw ID
    imageId: dbCourse.image_id,
    imageDataUri: dbCourse.image_data_uri,
    duration: dbCourse.duration,
    format: dbCourse.format,
    price: dbCourse.price,
    currency: dbCourse.currency,
    generalObjective: dbCourse.general_objective,
    whatYouWillLearn: dbCourse.what_you_will_learn || [],
    modules: dbCourse.modules || [],
    status: dbCourse.status,
  };
}

function mapCourseToDatabaseCourse(course: Partial<Course>): any {
  const dbCourse: any = {};
  if (course.id !== undefined) dbCourse.id = course.id;
  if (course.name !== undefined) dbCourse.name = course.name;
  if (course.category !== undefined) dbCourse.category = course.category;
  if (course.imageId !== undefined) dbCourse.image_id = course.imageId;
  if (course.imageDataUri !== undefined) dbCourse.image_data_uri = course.imageDataUri;
  if (course.duration !== undefined) dbCourse.duration = course.duration;
  if (course.format !== undefined) dbCourse.format = course.format;
  if (course.price !== undefined) dbCourse.price = course.price;
  if (course.currency !== undefined) dbCourse.currency = course.currency;
  if (course.generalObjective !== undefined) dbCourse.general_objective = course.generalObjective;
  if (course.whatYouWillLearn !== undefined) dbCourse.what_you_will_learn = course.whatYouWillLearn;
  if (course.modules !== undefined) dbCourse.modules = course.modules;
  if (course.status !== undefined) dbCourse.status = course.status;
  return dbCourse;
}
