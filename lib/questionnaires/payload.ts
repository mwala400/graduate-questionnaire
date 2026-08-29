import { QuestionnaireDef } from './blocks';

export type Payload = Record<string, any>;

/** Builds an empty payload object with the right shape for a given questionnaire def. */
export function emptyPayload(def: QuestionnaireDef): Payload {
  const payload: Payload = {};
  for (const block of def.blocks) {
    switch (block.type) {
      case 'fields':
        for (const f of block.fields) payload[f.key] = '';
        break;
      case 'text':
        payload[block.key] = '';
        break;
      case 'single':
        payload[block.key] = '';
        if (block.otherKey) payload[block.otherKey] = '';
        break;
      case 'multi':
        payload[block.key] = [];
        if (block.otherKey) payload[block.otherKey] = '';
        break;
      case 'matrix':
        payload[block.key] = {};
        if (block.otherKey) payload[block.otherKey] = '';
        break;
      case 'boolean-list':
        payload[block.key] = [];
        break;
      case 'weighting':
        payload[block.key] = '';
        payload[block.otherKey] = {};
        if (block.assessmentKey) payload[block.assessmentKey] = '';
        if (block.assessmentOtherKey) payload[block.assessmentOtherKey] = {};
        break;
      case 'respondent':
        payload.respondentName = '';
        payload.respondentPosition = '';
        payload.respondentPhone = '';
        payload.respondentDate = '';
        break;
    }
  }
  return payload;
}

/** Very light structural check: every block's key(s) must exist on the payload (any type). */
export function isPayloadShapeValid(def: QuestionnaireDef, payload: any): boolean {
  if (!payload || typeof payload !== 'object') return false;
  for (const block of def.blocks) {
    switch (block.type) {
      case 'matrix':
      case 'multi':
      case 'single':
      case 'text':
      case 'boolean-list':
      case 'weighting':
        if (!(block.key in payload)) return false;
        break;
      case 'fields':
        for (const f of block.fields) if (!(f.key in payload)) return false;
        break;
    }
  }
  return true;
}

export function rowToPayload(row: { data: string }): Payload {
  try {
    return JSON.parse(row.data);
  } catch {
    return {};
  }
}

export function payloadToRowData(type: string, payload: Payload) {
  return { type, data: JSON.stringify(payload) };
}
