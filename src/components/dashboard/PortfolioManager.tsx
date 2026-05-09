"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, X, ChevronDown, ChevronUp, Save, Trash2, ImageIcon, Loader2 } from "lucide-react"
import { UploadZone } from "@/components/ui/UploadZone"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/lib/toast-context"
import type { OrgPortfolio } from "@/types/database"

interface Props {
  orgId: string
  items: OrgPortfolio[]
}

const emptyForm = { nome: "", ano_entrega: "", cidade: "", descricao: "" }
type FormState = typeof emptyForm

function FieldRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-sans text-txt-tertiary uppercase tracking-widest mb-1.5 block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full px-3 py-2.5 text-sm font-sans bg-sidebar-accent border border-sidebar-border rounded-xl text-sidebar-foreground placeholder:text-txt-tertiary/50 focus:outline-none focus:border-[var(--primary-default)]/50"

function FormFields({
  form,
  onChange,
}: {
  form: FormState
  onChange: (patch: Partial<FormState>) => void
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldRow label="Nome" required>
          <input
            type="text"
            value={form.nome}
            onChange={e => onChange({ nome: e.target.value })}
            placeholder="Ex: Residencial Aurora"
            className={inputCls}
          />
        </FieldRow>
        <FieldRow label="Ano de Entrega">
          <input
            type="number"
            value={form.ano_entrega}
            onChange={e => onChange({ ano_entrega: e.target.value })}
            placeholder="2023"
            min={1900}
            max={2099}
            className={inputCls}
          />
        </FieldRow>
        <FieldRow label="Cidade">
          <input
            type="text"
            value={form.cidade}
            onChange={e => onChange({ cidade: e.target.value })}
            placeholder="Ex: São Paulo"
            className={inputCls}
          />
        </FieldRow>
      </div>
      <FieldRow label="Descrição">
        <textarea
          value={form.descricao}
          onChange={e => onChange({ descricao: e.target.value })}
          rows={3}
          placeholder="Descrição livre do projeto..."
          className={inputCls + " resize-none"}
        />
      </FieldRow>
    </>
  )
}

export function PortfolioManager({ orgId, items: initial }: Props) {
  const { toast } = useToast()
  const [items, setItems] = useState(initial)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState(emptyForm)
  const [newFotos, setNewFotos] = useState<string[]>([])
  const [editForms, setEditForms] = useState<Record<string, FormState>>({})
  const [editFotos, setEditFotos] = useState<Record<string, string[]>>({})
  const [saving, setSaving] = useState(false)

  function toggleEdit(item: OrgPortfolio) {
    if (expanded === item.id) { setExpanded(null); return }
    setExpanded(item.id)
    setEditForms(prev => ({
      ...prev,
      [item.id]: {
        nome: item.nome,
        ano_entrega: item.ano_entrega?.toString() ?? "",
        cidade: item.cidade ?? "",
        descricao: item.descricao ?? "",
      },
    }))
    setEditFotos(prev => ({ ...prev, [item.id]: [...item.fotos] }))
  }

  function buildPayload(form: FormState, fotos: string[]) {
    return {
      nome: form.nome.trim(),
      ano_entrega: form.ano_entrega ? parseInt(form.ano_entrega) : null,
      cidade: form.cidade.trim() || null,
      descricao: form.descricao.trim() || null,
      fotos,
    }
  }

  async function saveNew() {
    if (!newForm.nome.trim()) { toast("Nome é obrigatório", "error"); return }
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("org_portfolio")
      .insert({ org_id: orgId, ...buildPayload(newForm, newFotos) })
      .select()
      .single()
    setSaving(false)
    if (error) { toast("Erro ao salvar", "error"); return }
    setItems(prev => [data as OrgPortfolio, ...prev])
    setNewForm(emptyForm)
    setNewFotos([])
    setShowNew(false)
    toast("Projeto adicionado!", "success")
  }

  async function saveEdit(id: string) {
    const form = editForms[id]
    if (!form?.nome?.trim()) { toast("Nome é obrigatório", "error"); return }
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("org_portfolio")
      .update(buildPayload(form, editFotos[id] ?? []))
      .eq("id", id)
      .select()
      .single()
    setSaving(false)
    if (error) { toast("Erro ao salvar", "error"); return }
    setItems(prev => prev.map(i => i.id === id ? (data as OrgPortfolio) : i))
    setExpanded(null)
    toast("Projeto atualizado!", "success")
  }

  async function remove(id: string) {
    if (!confirm("Remover este projeto do portfólio?")) return
    const supabase = createClient()
    const { error } = await supabase.from("org_portfolio").delete().eq("id", id)
    if (error) { toast("Erro ao remover", "error"); return }
    setItems(prev => prev.filter(i => i.id !== id))
    if (expanded === id) setExpanded(null)
    toast("Projeto removido", "success")
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => { setShowNew(!showNew); if (showNew) { setNewForm(emptyForm); setNewFotos([]) } }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-default)] text-black text-sm font-sans rounded-xl hover:opacity-90 transition-opacity"
        >
          {showNew ? <X size={15} /> : <Plus size={15} />}
          {showNew ? "Cancelar" : "Adicionar Projeto"}
        </button>
      </div>

      {showNew && (
        <div className="rounded-2xl border border-[var(--primary-default)]/30 bg-sidebar p-5 space-y-4">
          <h3 className="text-sm font-sans font-semibold text-sidebar-foreground/80">Novo Projeto</h3>
          <FormFields form={newForm} onChange={patch => setNewForm(p => ({ ...p, ...patch }))} />
          <FieldRow label="Fotos">
            <UploadZone
              bucket="assets"
              folder="org-portfolio"
              ownerType="organization"
              ownerId={orgId}
              value={newFotos}
              onChange={setNewFotos}
              maxFiles={10}
              acceptMime="image/*"
            />
          </FieldRow>
          <div className="flex justify-end">
            <button
              onClick={saveNew}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary-default)] text-black text-sm font-sans rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Salvar Projeto
            </button>
          </div>
        </div>
      )}

      {items.length === 0 && !showNew && (
        <div className="py-16 text-center text-txt-tertiary/50 font-sans text-sm border border-dashed border-sidebar-border rounded-2xl">
          Nenhum projeto histórico cadastrado ainda.
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => {
          const isOpen = expanded === item.id
          const thumb = item.fotos[0] ?? null
          return (
            <div key={item.id} className="rounded-2xl border border-sidebar-border bg-sidebar overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-sidebar-accent flex-shrink-0 flex items-center justify-center border border-sidebar-border">
                  {thumb
                    ? <Image src={thumb} alt={item.nome} width={56} height={56} className="w-full h-full object-cover" />
                    : <ImageIcon size={20} className="text-txt-tertiary/30" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans font-semibold text-sidebar-foreground truncate">{item.nome}</p>
                  <p className="text-xs font-sans text-txt-tertiary">
                    {[item.ano_entrega, item.cidade].filter(Boolean).join(" · ") || "Sem dados adicionais"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => remove(item.id)}
                    className="p-2 text-txt-tertiary/40 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => toggleEdit(item)}
                    className="p-2 text-txt-tertiary/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
                    title="Editar"
                  >
                    {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {isOpen && editForms[item.id] && (
                <div className="px-4 pb-4 pt-1 border-t border-sidebar-border space-y-4">
                  <FormFields
                    form={editForms[item.id]}
                    onChange={patch => setEditForms(p => ({ ...p, [item.id]: { ...p[item.id], ...patch } }))}
                  />
                  <FieldRow label="Fotos">
                    <UploadZone
                      bucket="assets"
                      folder="org-portfolio"
                      ownerType="organization"
                      ownerId={orgId}
                      value={editFotos[item.id] ?? []}
                      onChange={urls => setEditFotos(p => ({ ...p, [item.id]: urls }))}
                      maxFiles={10}
                      acceptMime="image/*"
                    />
                  </FieldRow>
                  <div className="flex justify-end">
                    <button
                      onClick={() => saveEdit(item.id)}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary-default)] text-black text-sm font-sans rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
