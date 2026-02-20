'use server';
/**
 * @fileOverview AI-powered email marketing campaign generation.
 *
 * - generateEmailCampaign - A function that handles the email content generation process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenerateEmailCampaignInputSchema, EmailCampaignContentSchema, type GenerateEmailCampaignInput, type EmailCampaignContent } from '@/lib/schemas';
import { getTemplateHtmlById } from '@/lib/email-templates';

export async function generateEmailCampaign(input: GenerateEmailCampaignInput): Promise<EmailCampaignContent> {
  return generateEmailCampaignFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEmailCampaignPrompt',
  input: { schema: GenerateEmailCampaignInputSchema },
  output: { schema: EmailCampaignContentSchema },
  prompt: `Você é um especialista em marketing por e-mail e copywriter. A sua tarefa é gerar o conteúdo de texto para um e-mail HTML.

**Contexto:**
- **Objetivo do E-mail:** {{{topic}}}
- **Tom de Voz:** {{{tone}}}
- **Idioma:** {{{language}}}
- **Template HTML Base (para referência de estrutura):**
\'\'\'html
{{{template}}}
\'\'\'

**A Sua Tarefa:**
Com base no contexto acima, gere o seguinte conteúdo em formato JSON:
1.  **subject**: Um assunto (título) de e-mail curto, impactante e que incentive a abertura.
2.  **bodyHtml**: O corpo completo do e-mail em formato HTML, preenchendo o template base. Use marcadores como '[LOGO_URL]', '[IMAGE_URL_1]', '[IMAGE_URL_2]', '[UNSUBSCRIBE_LINK]', '[COMPANY_NAME]', '[COMPANY_ADDRESS]' onde for apropriado. O HTML deve ser bem estruturado e pronto a usar.
3.  **buttonText**: O texto para o botão de call-to-action, que deve ser claro e direto.
4.  **buttonLink**: Um URL de exemplo para o botão, que seja relevante para o tópico.
`,
});

const generateEmailCampaignFlow = ai.defineFlow(
  {
    name: 'generateEmailCampaignFlow',
    inputSchema: GenerateEmailCampaignInputSchema,
    outputSchema: EmailCampaignContentSchema,
  },
  async (input) => {
    const templateHtml = getTemplateHtmlById(input.template);
    if (!templateHtml) {
        throw new Error(`Template com o ID '${input.template}' não encontrado.`);
    }

    const { output } = await prompt({...input, template: templateHtml });
    
    if (!output) {
      throw new Error('A IA não conseguiu gerar o conteúdo do e-mail.');
    }
    
    // Replace generic placeholders with more specific ones from our app's context
    const finalHtml = output.bodyHtml
        .replace(/\[UNSUBSCRIBE_LINK\]/g, '#')
        .replace(/\[COMPANY_NAME\]/g, 'NexusTalent')
        .replace(/\[COMPANY_ADDRESS\]/g, 'Luanda, Angola');

    return {
        ...output,
        bodyHtml: finalHtml,
    };
  }
);
