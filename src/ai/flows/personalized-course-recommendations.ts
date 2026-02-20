
'use server';

/**
 * @fileOverview Provides personalized course recommendations based on user profile, past activity, and career goals.
 *
 * - personalizedCourseRecommendations - A function that returns personalized course recommendations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PersonalizedCourseRecommendationsInputSchema, PersonalizedCourseRecommendationsOutputSchema, type PersonalizedCourseRecommendationsInput, type PersonalizedCourseRecommendationsOutput } from '@/lib/schemas';


export async function personalizedCourseRecommendations(
  input: PersonalizedCourseRecommendationsInput
): Promise<PersonalizedCourseRecommendationsOutput> {
  return personalizedCourseRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedCourseRecommendationsPrompt',
  input: {schema: PersonalizedCourseRecommendationsInputSchema},
  output: {schema: PersonalizedCourseRecommendationsOutputSchema},
  prompt: `You are an expert career advisor and AI assistant for an educational platform called NexusTalent. Your goal is to create a personalized learning plan for users.

User Profile & Goals:
"{{{userProfile}}}"

Available Courses (use this as the primary source for recommendations):
"{{{courseCatalog}}}"

Based on the user's profile and the available courses, generate a structured learning plan in Portuguese. Your response must include:
1.  A catchy and motivational title for the plan (planTitle).
2.  A list of 2 to 4 recommended courses FROM THE PROVIDED CATALOG. For each course, provide the course name and a concise reason explaining why it is a good fit for the user's goals.
3.  A brief summary of the expected outcomes and benefits for the user after completing the recommended courses (summary).
`,
});

const personalizedCourseRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedCourseRecommendationsFlow',
    inputSchema: PersonalizedCourseRecommendationsInputSchema,
    outputSchema: PersonalizedCourseRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
