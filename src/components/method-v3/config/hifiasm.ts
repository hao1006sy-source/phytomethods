export const hifiasmSections = [
 {id:'overview',title:'算法概览',headings:['一句话简介与开发背景']},
 {id:'principle',title:'核心计算原理：相位感知的组装图',headings:['计算思路','开发背景与核心流程','算法原理与图处理']},
 {id:'workflow',title:'主要分析步骤',headings:[]},
 {id:'input-output',title:'输入、输出与命令示例',headings:['输入与输出','输入、参数与结果','运行入口、输入检查与参数','输出文件阅读']},
 {id:'problem',title:'解决的生物学问题',headings:['研究问题']},
 {id:'applications',title:'植物研究案例',headings:['植物研究','已核实植物案例','植物案例及证据']},
 {id:'tutorial',title:'使用教程',headings:[]},
 {id:'evaluation',title:'适用范围与质量评估',headings:['适用范围与质量评估']},
 {id:'resources',title:'参考文献与相关资源',headings:['实践与来源','相关资源']},
];
export const hifiasmSteps = [
 {name:'输入检查',text:'检查 HiFi reads 文件、测序质量、样本信息与覆盖度。'},
 {name:'构建重叠关系',text:'基于高准确度长读段之间的可靠重叠建立序列关系。'},
 {name:'图处理与相位解析',text:'图简化与候选路径解析，结合可用证据利用相位信息。'},
 {name:'输出与评估',text:'按模式输出组装图，并独立评估连续性、完整度与准确度。'},
];
