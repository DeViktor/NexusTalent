'use server';
/**
 * @fileOverview AI-powered assessment test generation.
 *
 * - generateAssessmentTest - A function that handles the test generation process.
 * - GenerateAssessmentTestInput - The input type for the function.
 * - GenerateAssessmentTestOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenerateAssessmentTestInputSchema, GenerateAssessmentTestOutputSchema } from '@/lib/schemas';

export type GenerateAssessmentTestInput = z.infer<typeof GenerateAssessmentTestInputSchema>;
export type GenerateAssessmentTestOutput = z.infer<typeof GenerateAssessmentTestOutputSchema>;


export async function generateAssessmentTest(input: GenerateAssessmentTestInput): Promise<GenerateAssessmentTestOutput> {
  return generateAssessmentTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAssessmentTestPrompt',
  input: { schema: GenerateAssessmentTestInputSchema },
  output: { schema: GenerateAssessmentTestOutputSchema },
  prompt: `You are an expert in creating professional assessments for job candidates. Your task is to generate a test in Portuguese based on the provided job description, requirements, and desired difficulty.

**Job Description:**
{{{jobDescription}}}

**Test Requirements:**
- Test Type: {{{testType}}}
- Difficulty Level: {{{level}}}
- Number of Multiple-Choice Questions: {{{numMultipleChoice}}}
- Number of Short-Answer Questions: {{{numShortAnswer}}}

**Instructions:**
1.  Generate a concise and relevant title for the test.
2.  Generate a unique ID for the test (e.g., 'test-followed-by-random-chars').
3.  For each question, generate a unique ID (e.g., 'q1', 'q2').
4.  If the **testType** is 'knowledge', create questions that assess the technical skills and knowledge required for the job, adjusting the complexity based on the specified **difficulty level**. Use a mix of {{{numMultipleChoice}}} multiple-choice and {{{numShortAnswer}}} short-answer questions. For short-answer questions, ask the candidate to explain their reasoning or provide a code snippet if applicable.
5.  If the **testType** is 'psychometric', create questions that evaluate logical reasoning, problem-solving abilities, and behavioral traits relevant to the role, again considering the **difficulty level**. All questions in this case should be multiple-choice.
6.  **IMPORTANT:** Ensure all multiple-choice questions have exactly 4 plausible options and specify the correct answer by setting 'correctAnswerIndex'.`,
});

const generateAssessmentTestFlow = ai.defineFlow(
  {
    name: 'generateAssessmentTestFlow',
    inputSchema: GenerateAssessmentTestInputSchema,
    outputSchema: GenerateAssessmentTestOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a valid test structure.');
    }
    return output;
  }
);
