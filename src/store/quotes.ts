import { create } from 'zustand';
import { nanoid } from 'nanoid';

export interface QuoteFieldSelectOption { id: string; label: string; value: number; percent?: boolean; }
export interface QuoteFieldBase { id: string; label: string; }
export interface QuoteFieldSelect extends QuoteFieldBase { type: 'select'; options: QuoteFieldSelectOption[]; }
export interface QuoteFieldText extends QuoteFieldBase { type: 'text'; basePrice?: number; }
export interface QuoteFieldNumber extends QuoteFieldBase { type: 'number'; unit: string; multiplier: number; min?: number; step?: number; }
export type QuoteField = QuoteFieldSelect | QuoteFieldText | QuoteFieldNumber;

export interface QuoteItem { fieldId: string; optionId?: string; text?: string; amount: number; }
export interface Quote { id: string; client: string; items: QuoteItem[]; total: number; createdAt: string; }

type NewFieldInput =
  | { type: 'select'; label: string; options: QuoteFieldSelectOption[] }
  | { type: 'text'; label: string; basePrice?: number }
  | { type: 'number'; label: string; unit: string; multiplier: number; min?: number; step?: number };

interface QuoteState {
  fields: QuoteField[];
  quotes: Quote[];
  search: string;
  setSearch: (s: string) => void;
  addField: (data: NewFieldInput) => void;
  updateField: (id: string, patch: Partial<QuoteField>) => void;
  addQuote: (data: { client: string; items: Omit<QuoteItem, 'amount'>[]; total: number }) => Quote;
}

export const useQuoteStore = create<QuoteState>((set, get) => ({
  fields: [
    { id: 'tamanho', label: 'Tamanho da Tatuagem', type: 'select', options: [
      { id: 'peq', label: 'Pequena (até 5 cm) - R$100', value: 10000 },
      { id: 'med', label: 'Média (5 a 15 cm) - R$180', value: 18000 },
      { id: 'grd', label: 'Grande (acima de 15 cm) - R$250', value: 25000 },
    ] },
    { id: 'dificuldade', label: 'Dificuldade', type: 'select', options: [
      { id: 'simples', label: 'Simples (+R$20)', value: 2000 },
      { id: 'media', label: 'Média (+R$70)', value: 7000 },
      { id: 'alta', label: 'Alta (+R$150)', value: 15000 },
    ] },
    { id: 'regiao', label: 'Região do Corpo', type: 'select', options: [
      { id: 'braco', label: 'Braço / Canela / Panturrilha (0%)', value: 0, percent: true },
      { id: 'nuca', label: 'Nuca / Costas (+10%)', value: 10, percent: true },
      { id: 'coxa', label: 'Coxa (+15%)', value: 15, percent: true },
      { id: 'articulacao', label: 'Cotovelo / Joelho (+20%)', value: 20, percent: true },
      { id: 'extremo', label: 'Pé / Mão / Dedo (+50%)', value: 50, percent: true },
      { id: 'pescoco', label: 'Pescoço / Barriga (+30%)', value: 30, percent: true },
      { id: 'intima', label: 'Parte Íntima (+60%)', value: 60, percent: true },
    ] },
    { id: 'cores', label: 'Quantidade de Cores', type: 'select', options: [
      { id: 'pb', label: 'Preto e Cinza (+R$20)', value: 2000 },
      { id: 'duas4', label: '2 a 4 cores (+R$50)', value: 5000 },
      { id: '5mais', label: '5+ cores (+R$70)', value: 7000 },
    ] },
    { id: 'agulhas', label: 'Agulha / Preenchimento', type: 'select', options: [
      { id: 'linha', label: 'Apenas linha (+R$20)', value: 2000 },
      { id: 'medio', label: 'Linha + preenchimento médio (+R$50)', value: 5000 },
      { id: 'muito', label: 'Muito preenchimento (+R$100)', value: 10000 },
    ] },
    { id: 'horas', label: 'Horas (estimadas)', type: 'number', unit: 'h', multiplier: 10000, min: 1, step: 0.5 }, // R$100/h
    { id: 'descricao', label: 'Descrição', type: 'text', basePrice: 0 }
  ],
  quotes: [],
  search: '',
  setSearch: (s) => set({ search: s }),
  addField: (data) => set(state => {
    let field: QuoteField;
    if (data.type === 'select') {
      field = { id: nanoid(), type: 'select', label: data.label, options: data.options };
    } else if (data.type === 'text') {
      field = { id: nanoid(), type: 'text', label: data.label, basePrice: data.basePrice };
    } else {
      field = { id: nanoid(), type: 'number', label: data.label, unit: data.unit, multiplier: data.multiplier, min: data.min, step: data.step };
    }
    return { fields: [...state.fields, field] };
  }),
  updateField: (id, patch) => set(state => ({ fields: state.fields.map(f => f.id === id ? { ...f, ...patch } as QuoteField : f) })),
  addQuote: (data) => {
    const q: Quote = { id: nanoid(), client: data.client, items: [], total: data.total, createdAt: new Date().toISOString() };
    set(state => ({ quotes: [q, ...state.quotes] }));
    return q;
  }
}));
