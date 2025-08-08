'use server';

/**
 * @fileOverview A flow for analyzing insurance claims data to identify trends, anomalies, and potential areas of concern or opportunity.
 *
 * - analyzeInsuranceClaims - A function that handles the insurance claims analysis process.
 * - AnalyzeInsuranceClaimsInput - The input type for the analyzeInsuranceClaims function.
 * - AnalyzeInsuranceClaimsOutput - The return type for the analyzeInsuranceClaims function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeInsuranceClaimsInputSchema = z.object({
  csvData: z
    .string()
    .describe(
      'The insurance claims data in CSV format.'
    ),
});
export type AnalyzeInsuranceClaimsInput = z.infer<typeof AnalyzeInsuranceClaimsInputSchema>;

const AnalyzeInsuranceClaimsOutputSchema = z.object({
  analysisResult: z.string().describe('The analysis result of the insurance claims data.'),
});
export type AnalyzeInsuranceClaimsOutput = z.infer<typeof AnalyzeInsuranceClaimsOutputSchema>;

export async function analyzeInsuranceClaims(input: AnalyzeInsuranceClaimsInput): Promise<AnalyzeInsuranceClaimsOutput> {
  return analyzeInsuranceClaimsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeInsuranceClaimsPrompt',
  input: {schema: AnalyzeInsuranceClaimsInputSchema},
  output: {schema: AnalyzeInsuranceClaimsOutputSchema},
  prompt: `You are an expert insurance claims analyst.

You will analyze the provided insurance claims data in CSV format and identify key trends, anomalies, and potential areas of concern or opportunity.

Provide a detailed analysis result.

CSV Data: {{{csvData}}}`,
});

const analyzeInsuranceClaimsFlow = ai.defineFlow(
  {
    name: 'analyzeInsuranceClaimsFlow',
    inputSchema: AnalyzeInsuranceClaimsInputSchema,
    outputSchema: AnalyzeInsuranceClaimsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
