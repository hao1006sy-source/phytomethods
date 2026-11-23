/**
 * PhytoMethods 算法与软件历史版本时序模型 (Software Version Chronology)
 * 严格区分：软件首次发布年份 (firstReleaseYear)、软件特定版本 (knownVersions) 与 当前收录代表性论文年份 (canonicalPaperYear)
 */

export interface KnownMethodVersion {
  version: string;
  releaseYear?: number;
  doi?: string;
  source?: string;
  note?: string;
}

export interface MethodChronology {
  methodId: string;
  name: string;
  firstReleaseYear?: number;
  firstReleaseSource?: string;
  canonicalPaperId?: string;
  canonicalPaperYear?: number;
  knownVersions?: KnownMethodVersion[];
}

/**
 * 具有严谨历史版本考证的重点工具时序注册表
 */
export const methodChronologies: Record<string, MethodChronology> = {
  paml: {
    methodId: 'paml',
    name: 'PAML',
    firstReleaseYear: 1997,
    firstReleaseSource: 'Yang Z. PAML: a program package for phylogenetic analysis by maximum likelihood. CABIOS 1997; 13(5):555–556. DOI: 10.1093/bioinformatics/13.5.555',
    canonicalPaperId: 'paml-paper',
    canonicalPaperYear: 2007,
    knownVersions: [
      {
        version: 'PAML 1.x',
        releaseYear: 1997,
        doi: '10.1093/bioinformatics/13.5.555',
        source: 'CABIOS 1997'
      },
      {
        version: 'PAML 3.14',
        releaseYear: 2004,
        note: 'Benderoth et al. (PNAS 2006) 明确报告使用的密码子模型与分支位点选择分析版本'
      },
      {
        version: 'PAML 4',
        releaseYear: 2007,
        doi: '10.1093/molbev/msm088',
        source: 'MBE 2007 paml-paper'
      }
    ]
  },
  gapit: {
    methodId: 'gapit',
    name: 'GAPIT',
    firstReleaseYear: 2012,
    firstReleaseSource: 'Lipka AE, Tian F, Wang Q, et al. GAPIT: genome association and prediction integrated tool. Bioinformatics 2012; 28(18):2397–2399. DOI: 10.1093/bioinformatics/bts444',
    canonicalPaperId: 'gapit3-paper',
    canonicalPaperYear: 2021,
    knownVersions: [
      {
        version: 'GAPIT 1.0',
        releaseYear: 2012,
        doi: '10.1093/bioinformatics/bts444',
        source: 'Bioinformatics 2012 首发论文'
      },
      {
        version: 'GAPIT 2',
        releaseYear: 2016,
        source: 'Tang et al. 2016'
      },
      {
        version: 'GAPIT 3',
        releaseYear: 2021,
        doi: '10.1016/j.gpb.2021.08.005',
        source: 'GPB 2021 gapit3-paper'
      }
    ]
  },
  selscan: {
    methodId: 'selscan',
    name: 'selscan',
    firstReleaseYear: 2014,
    firstReleaseSource: 'Szpiech ZA, Hernandez RD. selscan: an efficient multi-threaded program to perform EHH-based scans for positive selection. MBE 2014; 31(10):2824–2827. DOI: 10.1093/molbev/msu211',
    canonicalPaperId: 'selscan-paper',
    canonicalPaperYear: 2014,
    knownVersions: [
      {
        version: 'v1.0.0',
        releaseYear: 2014,
        doi: '10.1093/molbev/msu211',
        source: 'MBE 2014 selscan-paper'
      }
    ]
  },
  msmc: {
    methodId: 'msmc',
    name: 'MSMC',
    firstReleaseYear: 2014,
    firstReleaseSource: 'Schiffels S, Durbin R. Inferring human population size and separation history from multiple genome sequences. Nature Genetics 2014; 46(8):919–925. DOI: 10.1038/ng.3015',
    canonicalPaperId: 'msmc-paper',
    canonicalPaperYear: 2014,
    knownVersions: [
      {
        version: 'MSMC 1.0.0',
        releaseYear: 2014,
        doi: '10.1038/ng.3015',
        source: 'Nature Genetics 2014 msmc-paper'
      },
      {
        version: 'MSMC 1.1.0',
        releaseYear: 2017,
        note: 'Cubry et al. (Current Biology 2018) 非洲稻研究所使用的 MSMC 版本'
      }
    ]
  },
  msmc2: {
    methodId: 'msmc2',
    name: 'MSMC2',
    firstReleaseYear: 2016,
    firstReleaseSource: 'Schiffels S. MSMC2 GitHub Release v2.0.0 (2016-05-16). https://github.com/stschiff/msmc2',
    canonicalPaperId: 'msmc2-protocol',
    canonicalPaperYear: 2020,
    knownVersions: [
      {
        version: 'v2.0.0',
        releaseYear: 2016,
        source: 'GitHub Release v2.0.0 (2016-05-16)'
      },
      {
        version: 'v2.1.1',
        releaseYear: 2018,
        source: 'GitHub Release v2.1.1'
      },
      {
        version: 'v2.1.2',
        releaseYear: 2020,
        doi: '10.1007/978-1-0716-0199-0_7',
        source: 'Methods Mol Biol 2020 msmc2-protocol'
      }
    ]
  }
};

/**
 * 查询工具的首次真实发布年份（优先核实记录，无记录则退化为代表论文年份或 undefined）
 */
export function getMethodFirstReleaseYear(methodId: string, fallbackCanonicalYear?: number): {
  firstReleaseYear?: number;
  source?: string;
  isExplicitReleaseYear: boolean;
} {
  const record = methodChronologies[methodId];
  if (record?.firstReleaseYear) {
    return {
      firstReleaseYear: record.firstReleaseYear,
      source: record.firstReleaseSource,
      isExplicitReleaseYear: true
    };
  }
  return {
    firstReleaseYear: fallbackCanonicalYear,
    source: fallbackCanonicalYear ? '代表性论文发表年份 (待核验首发年份)' : undefined,
    isExplicitReleaseYear: false
  };
}
