/**
 * PhytoMethods 核心工具常见报错与故障排查知识库
 */

export interface TroubleshootingEntry {
  methodId: string;
  errorId: string;
  errorPattern: string;
  errorType: 'oom' | 'input_format' | 'parameter' | 'compilation' | 'numerical';
  symptom: string;
  rootCause: string;
  diagnosticCommand?: string;
  solution: string;
}
