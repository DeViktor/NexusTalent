'use server';
/**
 * @fileOverview AI-powered module assessment generation.
 *
 * - generateModuleAssessment - A function that handles the test generation process.
 * - GenerateModuleAssessmentInput - The input type for the function.
 * - GenerateModuleAssessmentOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenerateModuleAssessmentInputSchema, GenerateModuleAssessmentOutputSchema } from '@/lib/schemas';

export type GenerateModuleAssessmentInput = z.infer<typeof GenerateModuleAssessmentInputSchema>;
export type GenerateModuleAssessmentOutput = z.infer<typeof GenerateModuleAssessmentOutputSchema>;


export async function generateModuleAssessment(input: GenerateModuleAssessmentInput): Promise<GenerateModuleAssessmentOutput> {
  return generateModuleAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateModuleAssessmentPrompt',
  input: { schema: GenerateModuleAssessmentInputSchema },
  output: { schema: GenerateModuleAssessmentOutputSchema },
  prompt: `You are an expert in creating educational assessments. Your task is to generate a quiz based on a course module's title, topics, and requested parameters.

Module Title:
{{{moduleTitle}}}

Topics Covered:
{{#each topics}}
- {{{this}}}
{{/each}}

Difficulty Level: {{{level}}}

Generate a quiz with:
- {{{numMultipleChoice}}} multiple-choice questions. Each must have exactly 4 plausible options, and you must indicate the correct one by setting 'correctAnswerIndex'.
- {{{numShortAnswer}}} short-answer questions. Each must have an ideal, concise answer.

The questions should be clear, directly related to the topics, and suitable for the specified difficulty level.`,
});

const generateModuleAssessmentFlow = ai.defineFlow(
  {
    name: 'generateModuleAssessmentFlow',
    inputSchema: GenerateModuleAssessmentInputSchema,
    outputSchema: GenerateModuleAssessmentOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
