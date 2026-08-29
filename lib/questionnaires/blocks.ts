// A questionnaire is just an ordered list of Blocks. One generic engine
// renders the form, another builds the .docx, another the .pdf, another
// the Excel export, and another the analytics — all by walking this same
// list — so adding a 5th questionnaire type later means writing a new
// block list, not new engines.

export interface FieldSpec {
  key: string;
  label: string;
  kind?: 'text' | 'email' | 'tel' | 'date';
}

export type Block =
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'fields'; fields: FieldSpec[] }
  | { type: 'text'; key: string; label: string }
  | {
      type: 'single';
      key: string;
      legend?: string;
      options: string[];
      otherTrigger?: string; // if the chosen option equals this, show the "specify" box
      otherKey?: string;
    }
  | {
      type: 'multi';
      key: string;
      legend?: string;
      options: string[];
      otherTrigger?: string;
      otherKey?: string;
    }
  | {
      type: 'matrix';
      key: string; // payload key holding a MatrixAnswer
      title: string; // column header for the item name column
      items: string[];
      otherKey?: string; // payload key for the free-text "other" line
      otherLabel?: string;
    }
  | {
      type: 'boolean-list';
      key: string; // payload key holding a string[] of ticked items
      title: string;
      items: string[];
    }
  | {
      type: 'weighting';
      key: string; // payload key: 'A'|'B'|'C'|'D'|'E'|'OTHER'
      otherKey: string; // payload key holding the custom {lecture,tutorial,...} numbers
      withAssessment?: boolean;
      assessmentKey?: string;
      assessmentOtherKey?: string;
    }
  | { type: 'respondent' };

export interface QuestionnaireDef {
  key: 'graduate' | 'society' | 'employer' | 'professional';
  slug: string;
  label: string; // human name, e.g. "Graduates' Questionnaire"
  shortLabel: string; // for nav/menus
  docTitle: string; // title printed at the top of generated documents
  blocks: Block[];
}
