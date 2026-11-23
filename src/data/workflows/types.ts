/**
 * 植物基因组学与生物信息学端到端分析工作流 (End-to-End Research Workflows)
 */

export interface WorkflowToolRef {
  methodId: string;
  name: string;
  role: string;
  recommendedParams?: string;
  alternativeMethodIds?: string[];
}

export interface WorkflowPhase {
  id: string;
  order: number;
  title: string;
  englishTitle: string;
  summary: string;
  recommendedTools: WorkflowToolRef[];
  inputData: string[];
  outputData: string[];
  qualityCheckpoints: string[];
  tutorialId?: string;
  estimatedDuration?: string;
}

export interface ResearchWorkflow {
  id: string;
  title: string;
  englishTitle: string;
  summary: string;
  targetScenario: string;
  plantCases: string[];
  recommendedCompute: string;
  phases: WorkflowPhase[];
  mermaidDiagram: string;
}
