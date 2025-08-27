import { useQuoteStore } from '../../store/quotes';
import { useState } from 'react';

export const SettingsPage = () => {
  const { fields, addField, updateField } = useQuoteStore();
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<'select' | 'text'>('select');
  const [options, setOptions] = useState<{ label: string; value: number; percent?: boolean }[]>([]);
  const [textBase, setTextBase] = useState<number>(0);

  const addOption = () => setOptions(o => [...o, { label: '', value: 0 }]);
  const updateOption = (idx: number, patch: Partial<{ label: string; value: number }>) => setOptions(o => o.map((op, i) => i === idx ? { ...op, ...patch } : op));

  const saveField = () => {
    if (!newLabel) return;
    if (newType === 'select') {
  addField({ label: newLabel, type: 'select', options: options.map(o => ({ id: o.label.toLowerCase() || Math.random().toString(), label: o.label, value: o.value, percent: o.percent })) });
    } else {
  addField({ label: newLabel, type: 'text', basePrice: textBase });
    }
    setNewLabel(''); setOptions([]); setTextBase(0);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold">Configurações de Campos</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-neutral-900 ring-1 ring-neutral-800 space-y-4">
            <div className="text-sm font-medium">Novo Campo</div>
            <div className="space-y-2">
              <input placeholder="Label" value={newLabel} onChange={e => setNewLabel(e.target.value)} className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
              <select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600">
                <option value="select">Seleção</option>
                <option value="text">Texto</option>
              </select>
              {newType === 'select' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs text-neutral-500"><span>Opções</span><button type="button" onClick={addOption} className="text-brand-400 hover:text-brand-300">+ opção</button></div>
                  <div className="space-y-2">
                    {options.map((op, i) => (
                      <div key={i} className="flex gap-2">
                        <input placeholder="Label" value={op.label} onChange={e => updateOption(i, { label: e.target.value })} className="flex-1 bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
                        <input placeholder="Valor (R$)" type="number" value={op.value/100} onChange={e => updateOption(i, { value: Math.round(parseFloat(e.target.value || '0') * 100) })} className="w-32 bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {newType === 'text' && (
                <div>
                  <label className="block text-xs mb-1 text-neutral-500">Valor Base (R$)</label>
                  <input type="number" value={textBase/100} onChange={e => setTextBase(Math.round(parseFloat(e.target.value || '0') * 100))} className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
                </div>
              )}
              <button onClick={saveField} className="w-full py-2 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium">Adicionar</button>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="text-sm font-medium">Campos Existentes</div>
          <div className="space-y-3">
            {fields.filter(f => f.id !== 'horas' && f.id !== 'descricao').map(f => (
              <EditableFieldCard key={f.id} field={f} onSave={updateField} />
            ))}
            {fields.length === 0 && <div className="text-xs text-neutral-500">Nenhum campo.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para editar campo existente
const EditableFieldCard = ({ field, onSave }: { field: any; onSave: (id: string, patch: any) => void }) => {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState<any>(field);
  const toggle = () => { setLocal(field); setEditing(e => !e); };
  const save = () => { onSave(field.id, local); setEditing(false); };
  return (
    <div className="p-4 rounded-lg bg-neutral-900 ring-1 ring-neutral-800 space-y-2">
      <div className="flex justify-between items-center">
        <div className="font-medium">{field.label}</div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-neutral-500">{field.type}</div>
          <button onClick={toggle} className="text-xs text-brand-400 hover:text-brand-300">{editing ? 'Cancelar' : 'Editar'}</button>
        </div>
      </div>
      {!editing && field.type === 'select' && (
        <ul className="mt-1 space-y-1 text-xs text-neutral-400">
          {field.options?.map((o: any) => (<li key={o.id}>{o.label}{o.percent ? ` - ${o.value}%` : ` - R$ ${(o.value/100).toFixed(2)}`}</li>))}
        </ul>
      )}
      {!editing && field.type === 'text' && field.basePrice && (
        <div className="text-xs text-neutral-400">Valor base: R$ {(field.basePrice/100).toFixed(2)}</div>
      )}
      {!editing && field.type === 'number' && (
        <div className="text-xs text-neutral-400">Multiplicador: R$ {(field.multiplier/100).toFixed(2)} / {field.unit}</div>
      )}
      {editing && (
        <div className="space-y-3">
          <input value={local.label} onChange={e => setLocal((l: any) => ({ ...l, label: e.target.value }))} className="w-full bg-neutral-800 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600" />
          {field.type === 'select' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-neutral-500"><span>Opções</span><button type="button" onClick={() => setLocal((l: any) => ({ ...l, options: [...l.options, { id: Math.random().toString(36).slice(2), label: '', value: 0 }] }))} className="text-brand-400 hover:text-brand-300">+ opção</button></div>
              <div className="space-y-2">
                {local.options.map((op: any, i: number) => (
                  <div key={op.id} className="flex gap-2 items-center">
                    <input value={op.label} onChange={e => setLocal((l: any) => ({ ...l, options: l.options.map((o: any, idx: number) => idx===i ? { ...o, label: e.target.value } : o) }))} placeholder="Label" className="flex-1 bg-neutral-800 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600" />
                    <input type="number" value={op.valueDisplay || (op.percent? op.value : op.value/100)} onChange={e => {
                      const raw = parseFloat(e.target.value || '0');
                      setLocal((l: any) => ({ ...l, options: l.options.map((o: any, idx: number) => idx===i ? { ...o, value: op.percent ? raw : Math.round(raw*100) } : o) }));
                    }} className="w-20 bg-neutral-800 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600" />
                    <label className="flex items-center gap-1 text-[10px] text-neutral-400">
                      <input type="checkbox" checked={!!op.percent} onChange={e => setLocal((l: any) => ({ ...l, options: l.options.map((o: any, idx: number) => idx===i ? { ...o, percent: e.target.checked } : o) }))} /> %
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {field.type === 'text' && (
            <div>
              <label className="block text-[10px] mb-1 text-neutral-500">Valor base (R$)</label>
              <input type="number" value={(local.basePrice||0)/100} onChange={e => setLocal((l: any) => ({ ...l, basePrice: Math.round(parseFloat(e.target.value||'0')*100) }))} className="w-full bg-neutral-800 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </div>
          )}
          {field.type === 'number' && (
            <div>
              <label className="block text-[10px] mb-1 text-neutral-500">Valor por {field.unit} (R$)</label>
              <input type="number" value={(local.multiplier||0)/100} onChange={e => setLocal((l: any) => ({ ...l, multiplier: Math.round(parseFloat(e.target.value||'0')*100) }))} className="w-full bg-neutral-800 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={save} className="px-3 py-1 rounded-md bg-brand-600 hover:bg-brand-500 text-xs font-medium text-white">Salvar</button>
          </div>
        </div>
      )}
    </div>
  );
};
