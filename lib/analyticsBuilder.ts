import { QuestionnaireDef } from './questionnaires/blocks';
import { Payload } from './questionnaires/payload';
import { RATING_LEVELS } from './questionnaires/shared-options';

export interface ChartSection {
  key: string;
  title: string;
  kind: 'single' | 'multi' | 'matrix' | 'boolean-list';
  data: Record<string, number | string>[];
}

export function buildQuestionnaireAnalytics(def: QuestionnaireDef, payloads: Payload[]) {
  const sections: ChartSection[] = [];

  for (const block of def.blocks) {
    if (block.type === 'single') {
      sections.push({
        key: block.key,
        title: block.legend || block.key,
        kind: 'single',
        data: block.options.map((opt) => ({ name: opt, count: payloads.filter((p) => p[block.key] === opt).length }))
      });
    } else if (block.type === 'multi') {
      sections.push({
        key: block.key,
        title: block.legend || block.key,
        kind: 'multi',
        data: block.options.map((opt) => ({ name: opt, count: payloads.filter((p) => (p[block.key] || []).includes(opt)).length }))
      });
    } else if (block.type === 'matrix') {
      sections.push({
        key: block.key,
        title: block.title,
        kind: 'matrix',
        data: block.items.map((item) => {
          const entry: Record<string, number | string> = { name: item };
          RATING_LEVELS.forEach((lvl) => {
            entry[lvl] = payloads.filter((p) => (p[block.key] || {})[item] === lvl).length;
          });
          return entry;
        })
      });
    } else if (block.type === 'boolean-list') {
      sections.push({
        key: block.key,
        title: block.title,
        kind: 'boolean-list',
        data: block.items.map((item) => ({ name: item, count: payloads.filter((p) => (p[block.key] || []).includes(item)).length }))
      });
    }
  }

  return { totalResponses: payloads.length, sections };
}
