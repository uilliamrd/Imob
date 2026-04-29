"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Plus, X, ChevronDown, ChevronUp, Save, Trash2, Building2, Flame, CheckCircle, MapPin, Images, Code2, ExternalLink, FileDown, Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/ui/ImageUpload"
import { CustomPageEditor } from "@/components/dashboard/CustomPageEditor"
import { createClient } from "@/lib/supabase/client"
import type { Development } from "@/types/database"

type DocEntry = { name: string; url: string; type: string }

interface OrgOption { id: string; name: string }
interface BairroOption { id: string; name: string; city: string; state: string }

interface DevelopmentsManagerProps {
  developments: Development[]
  orgId?: string | null
  orgs?: OrgOption[]
  bairros?: BairroOption[]
}

const emptyForm = {
  name: "", address: "", neighborhood: "", city: "",
  description: "", is_lancamento: false, is_delivered: false,
}

export function DevelopmentsManager({ developments: initial, orgId, orgs = [], bairros = [] }: DevelopmentsManagerProps) {
  const [devs, setDevs] = useState(initial)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState(emptyForm)
  const [newOrgId, setNewOrgId] = useState(orgId ?? "")
  const [newImages, setNewImages] = useState<string[]>([])
  const [newCustomHtml, setNewCustomHtml] = useState("")
  const [newCustomType, setNewCustomType] = useState<"html" | "json" | null>(null)
  const [saving, setSaving] = useState(false)
  const [editForms, setEditForms] = useState<Record<string, Partial<Development>>>({})
  const [editImages, setEditImages] = useState<Record<string, string[]>>({})
  const [editCustomHtml, setEditCustomHtml] = useState<Record<string, string>>({})
  const [editCustomType, setEditCustomType] = useState<Record<string, "html" | "json" | null>>({})
  const [newDocuments, setNewDocuments] = useState<DocEntry[]>([])
  const [editDocuments, setEditDocuments] = useState<Record<string, DocEntry[]>>({})
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const newDocInputRef = useRef<HTMLInputElement>(null)
  const editDocInputRef = useRef<Record<string, HTMLInputElement | null>>({})

  async function uploadDoc(file: File, devId?: string): Promise<string | null> {
    const supabase = createClient()
    const folder = devId ? `developments/${devId}/docs` : `developments/docs`
    const ext = file.name.split(".").pop()
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from("property-images").upload(path, file, { cacheControl: "3600", upsert: false })
    if (error) return null
    return supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl
  }

  async function handleDocUpload(files: FileList | null, devId?: string) {
    if (!files?.length) return
    setUploadingDoc(true)
    for (const file of Array.from(files)) {
      const url = await uploadDoc(file, devId)
      if (!url) continue
      const name = file.name.replace(/\.[^/.]+$/, "")
      const entry: DocEntry = { name, url, type: file.type.includes("pdf") ? "pdf" : "documento" }
      if (devId) {
        setEditDocuments((p) => ({ ...p, [devId]: [...(p[devId] ?? []), entry] }))
      } else {
        setNewDocuments((p) => [...p, entry])
      }
    }
    setUploadingDoc(false)
  }

  const inputClass = "w-full bg-muted/50 border border-border text-white placeholder-muted-foreground/40 px-3 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
  const labelClass = "text-xs uppercase tracking-[0.12em] text-muted-foreground font-sans block mb-1.5"

  async function createDev() {
    if (!newForm.name.trim()) return
    setSaving(true)
    const res = await fetch("/api/admin/developments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newForm,
        org_id: newOrgId || orgId || null,
        images: newImages,
        cover_image: newImages[0] ?? null,
        custom_page_html: newCustomHtml || null,
        custom_page_type: newCustomType,
        documents: newDocuments,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setDevs((prev) => [data as Development, ...prev])
      setNewForm(emptyForm)
      setNewImages([])
      setNewCustomHtml("")
      setNewCustomType(null)
      setNewDocuments([])
      setShowNew(false)
    }
    setSaving(false)
  }

  async function updateDev(id: string) {
    setSaving(true)
    const images = editImages[id] ?? devs.find((d) => d.id === id)?.images ?? []
    const customHtml = id in editCustomHtml ? editCustomHtml[id] : (devs.find((d) => d.id === id)?.custom_page_html ?? null)
    const customType = id in editCustomType ? editCustomType[id] : (devs.find((d) => d.id === id)?.custom_page_type ?? null)
    const documents = editDocuments[id] ?? devs.find((d) => d.id === id)?.documents ?? []
    const patch = {
      ...editForms[id],
      images,
      cover_image: images[0] ?? null,
      custom_page_html: customHtml || null,
      custom_page_type: customType,
      documents,
    }
    const res = await fetch(`/api/admin/developments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    if (res.ok) {
      setDevs((prev) => prev.map((d) => d.id === id ? { ...d, ...patch } as Development : d))
      setExpanded(null)
    }
    setSaving(false)
  }

  async function deleteDev(id: string) {
    if (!confirm("Excluir este empreendimento? Os imóveis vinculados serão desvinculados.")) return
    const res = await fetch(`/api/admin/developments/${id}`, { method: "DELETE" })
    if (res.ok) setDevs((prev) => prev.filter((d) => d.id !== id))
  }

  function startEdit(dev: Development) {
    setEditForms((prev) => ({ ...prev, [dev.id]: { ...dev } }))
    setEditImages((prev) => ({ ...prev, [dev.id]: dev.images?.length ? dev.images : (dev.cover_image ? [dev.cover_image] : []) }))
    setEditDocuments((prev) => ({ ...prev, [dev.id]: dev.documents?.length ? [...dev.documents] : [] }))
    setExpanded(dev.id)
  }

  return (
    <div className="space-y-3">
      <button onClick={() => setShowNew(!showNew)}
        className="flex items-center gap-2 px-4 py-2.5 border border-gold/30 text-gold hover:bg-gold/10 transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg">
        <Plus size={14} /> Novo Empreendimento
      </button>

      {/* ── New form ─────────────────────────────────────────── */}
      {showNew && (
        <div className="bg-muted/50 border border-gold/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gold text-sm font-sans font-medium">Novo Empreendimento</p>
            <button type="button" onClick={() => setShowNew(false)}><X size={14} className="text-muted-foreground" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orgs.length > 0 && (
              <div className="md:col-span-2">
                <label className={labelClass}>Construtora / Organização</label>
                <select value={newOrgId} onChange={(e) => setNewOrgId(e.target.value)} className={inputClass}>
                  <option value="">— Sem organização —</option>
                  {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
            )}
            <div className="md:col-span-2">
              <label className={labelClass}>Nome *</label>
              <input type="text" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                placeholder="Ex: Residencial Beira Mar" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Endereço</label>
              <input type="text" value={newForm.address} onChange={(e) => setNewForm({ ...newForm, address: e.target.value })}
                placeholder="Av. Atlântica, 1000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Bairro</label>
              {bairros.length > 0 ? (
                <select
                  value={bairros.find((b) => b.name === newForm.neighborhood)?.id ?? ""}
                  onChange={(e) => {
                    const b = bairros.find((b) => b.id === e.target.value)
                    setNewForm({ ...newForm, neighborhood: b?.name ?? "", city: b?.city ?? newForm.city })
                  }}
                  className={inputClass}>
                  <option value="">— Selecione —</option>
                  {bairros.map((b) => <option key={b.id} value={b.id}>{b.name}{b.city ? ` — ${b.city}` : ""}</option>)}
                </select>
              ) : (
                <input type="text" value={newForm.neighborhood} onChange={(e) => setNewForm({ ...newForm, neighborhood: e.target.value })}
                  placeholder="Copacabana" className={inputClass} />
              )}
            </div>
            <div>
              <label className={labelClass}>Cidade</label>
              <input type="text" value={newForm.city} onChange={(e) => setNewForm({ ...newForm, city: e.target.value })}
                placeholder="Rio de Janeiro" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Descrição</label>
              <textarea value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                rows={2} placeholder="Descreva o empreendimento..." className={inputClass + " resize-none"} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>
                <span className="flex items-center gap-1.5"><Images size={11} /> Fotos (até 40) — a 1ª será capa</span>
              </label>
              <ImageUpload bucket="property-images" folder="developments"
                value={newImages} onChange={setNewImages} maxFiles={40} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>
                <span className="flex items-center gap-1.5"><FileDown size={11} /> Documentos / Apresentação PDF</span>
              </label>
              <input
                ref={newDocInputRef}
                type="file"
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                multiple
                className="hidden"
                onChange={(e) => handleDocUpload(e.target.files)}
              />
              <button
                type="button"
                onClick={() => newDocInputRef.current?.click()}
                disabled={uploadingDoc}
                className="flex items-center gap-2 px-4 py-2 border border-dashed border-border hover:border-gold/40 text-muted-foreground hover:text-gold transition-colors text-xs font-sans rounded-lg disabled:opacity-50"
              >
                {uploadingDoc ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                {uploadingDoc ? "Enviando..." : "Adicionar arquivo"}
              </button>
              {newDocuments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {newDocuments.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <FileDown size={12} className="text-gold/50 flex-shrink-0" />
                      <input
                        type="text"
                        value={doc.name}
                        onChange={(e) => setNewDocuments((p) => p.map((d, j) => j === i ? { ...d, name: e.target.value } : d))}
                        className="flex-1 bg-muted/30 border border-border text-white/80 px-2.5 py-1.5 rounded-lg font-sans text-xs focus:outline-none focus:border-gold/40"
                      />
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/50 hover:text-gold transition-colors" title="Abrir"><ExternalLink size={12} /></a>
                      <button type="button" onClick={() => setNewDocuments((p) => p.filter((_, j) => j !== i))} className="text-muted-foreground/40 hover:text-red-400 transition-colors"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>
                <span className="flex items-center gap-1.5"><Code2 size={11} /> Página de Vendas Customizada (opcional)</span>
              </label>
              <p className="text-muted-foreground/50 text-xs font-sans mb-2">
                Substitui o layout padrão do lançamento. As páginas das unidades continuam no modelo do sistema.
              </p>
              <CustomPageEditor
                value={newCustomHtml}
                type={newCustomType}
                onChange={(v, t) => { setNewCustomHtml(v); setNewCustomType(t) }}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newForm.is_lancamento}
                onChange={(e) => setNewForm({ ...newForm, is_lancamento: e.target.checked })}
                className="w-4 h-4 rounded accent-amber-500" />
              <Flame size={13} className="text-amber-400" />
              <span className="text-xs font-sans text-muted-foreground">Lançamento</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newForm.is_delivered}
                onChange={(e) => setNewForm({ ...newForm, is_delivered: e.target.checked })}
                className="w-4 h-4 rounded accent-emerald-500" />
              <CheckCircle size={13} className="text-emerald-400" />
              <span className="text-xs font-sans text-muted-foreground">Entregue (portfólio)</span>
            </label>
          </div>

          <button type="button" onClick={createDev} disabled={saving || !newForm.name.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-gold text-graphite hover:bg-gold-light disabled:opacity-50 transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg">
            <Save size={13} /> {saving ? "Salvando..." : "Criar Empreendimento"}
          </button>
        </div>
      )}

      {/* ── List ─────────────────────────────────────────────── */}
      {devs.length === 0 && !showNew && (
        <p className="text-muted-foreground/50 text-sm font-sans py-4 text-center">Nenhum empreendimento cadastrado ainda.</p>
      )}

      {devs.map((dev) => {
        const isExpanded = expanded === dev.id
        const form = editForms[dev.id] ?? dev
        const images = editImages[dev.id] ?? (dev.images?.length ? dev.images : (dev.cover_image ? [dev.cover_image] : []))
        const customHtml = dev.id in editCustomHtml ? editCustomHtml[dev.id] : (dev.custom_page_html ?? "")
        const customType = dev.id in editCustomType ? editCustomType[dev.id] : (dev.custom_page_type ?? null)

        return (
          <div key={dev.id} className="bg-muted/50 border border-border rounded-2xl overflow-hidden">
            {/* Row header */}
            <div className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
              onClick={() => isExpanded ? setExpanded(null) : startEdit(dev)}>
              <div className="flex items-center gap-3">
                {dev.cover_image
                  ? <Image src={dev.cover_image} alt="" width={40} height={40} className="w-10 h-10 rounded-lg object-cover border border-border" />
                  : <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center"><Building2 size={16} className="text-muted-foreground/50" /></div>
                }
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-foreground/90 text-sm font-sans font-medium">{dev.name}</p>
                    {dev.is_lancamento && <Flame size={11} className="text-amber-400" />}
                    {dev.is_delivered && <CheckCircle size={11} className="text-emerald-400" />}
                    {dev.custom_page_html && (
                      <span className="text-[10px] text-blue-400/60 font-sans flex items-center gap-0.5">
                        <Code2 size={9} /> custom
                      </span>
                    )}
                    {(dev.images?.length ?? 0) > 0 && (
                      <span className="text-[10px] text-muted-foreground/50 font-sans flex items-center gap-0.5">
                        <Images size={9} /> {dev.images.length}
                      </span>
                    )}
                  </div>
                  {(dev.neighborhood || dev.city) && (
                    <p className="text-muted-foreground text-xs font-sans flex items-center gap-1">
                      <MapPin size={9} />{dev.neighborhood}{dev.city ? `, ${dev.city}` : ""}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a href={`/lancamento/${dev.id}`} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground/50 hover:text-gold transition-colors p-1" title="Ver página pública">
                  <ExternalLink size={14} />
                </a>
                {isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
              </div>
            </div>

            {/* Edit panel */}
            {isExpanded && (
              <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Nome</label>
                    <input type="text" value={form.name ?? ""}
                      onChange={(e) => setEditForms((p) => ({ ...p, [dev.id]: { ...p[dev.id], name: e.target.value } }))}
                      className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Endereço</label>
                    <input type="text" value={form.address ?? ""}
                      onChange={(e) => setEditForms((p) => ({ ...p, [dev.id]: { ...p[dev.id], address: e.target.value } }))}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Bairro</label>
                    {bairros.length > 0 ? (
                      <select
                        value={bairros.find((b) => b.name === form.neighborhood)?.id ?? ""}
                        onChange={(e) => {
                          const b = bairros.find((b) => b.id === e.target.value)
                          setEditForms((p) => ({ ...p, [dev.id]: { ...p[dev.id], neighborhood: b?.name ?? "", city: b?.city ?? p[dev.id]?.city ?? "" } }))
                        }}
                        className={inputClass}>
                        <option value="">— Selecione —</option>
                        {bairros.map((b) => <option key={b.id} value={b.id}>{b.name}{b.city ? ` — ${b.city}` : ""}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={form.neighborhood ?? ""}
                        onChange={(e) => setEditForms((p) => ({ ...p, [dev.id]: { ...p[dev.id], neighborhood: e.target.value } }))}
                        className={inputClass} />
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Cidade</label>
                    <input type="text" value={form.city ?? ""}
                      onChange={(e) => setEditForms((p) => ({ ...p, [dev.id]: { ...p[dev.id], city: e.target.value } }))}
                      className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Descrição</label>
                    <textarea value={form.description ?? ""}
                      onChange={(e) => setEditForms((p) => ({ ...p, [dev.id]: { ...p[dev.id], description: e.target.value } }))}
                      rows={2} className={inputClass + " resize-none"} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5"><Images size={11} /> Fotos (até 40) — a 1ª será capa</span>
                    </label>
                    <ImageUpload bucket="property-images" folder={`developments/${dev.id}`}
                      value={images} onChange={(u) => setEditImages((p) => ({ ...p, [dev.id]: u }))} maxFiles={40} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5"><FileDown size={11} /> Documentos / Apresentação PDF</span>
                    </label>
                    <input
                      ref={(el) => { editDocInputRef.current[dev.id] = el }}
                      type="file"
                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                      multiple
                      className="hidden"
                      onChange={(e) => handleDocUpload(e.target.files, dev.id)}
                    />
                    <button
                      type="button"
                      onClick={() => editDocInputRef.current[dev.id]?.click()}
                      disabled={uploadingDoc}
                      className="flex items-center gap-2 px-4 py-2 border border-dashed border-border hover:border-gold/40 text-muted-foreground hover:text-gold transition-colors text-xs font-sans rounded-lg disabled:opacity-50"
                    >
                      {uploadingDoc ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                      {uploadingDoc ? "Enviando..." : "Adicionar arquivo"}
                    </button>
                    {(editDocuments[dev.id] ?? []).length > 0 && (
                      <div className="mt-2 space-y-2">
                        {(editDocuments[dev.id] ?? []).map((doc, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <FileDown size={12} className="text-gold/50 flex-shrink-0" />
                            <input
                              type="text"
                              value={doc.name}
                              onChange={(e) => setEditDocuments((p) => ({
                                ...p,
                                [dev.id]: (p[dev.id] ?? []).map((d, j) => j === i ? { ...d, name: e.target.value } : d),
                              }))}
                              className="flex-1 bg-muted/30 border border-border text-white/80 px-2.5 py-1.5 rounded-lg font-sans text-xs focus:outline-none focus:border-gold/40"
                            />
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/50 hover:text-gold transition-colors" title="Abrir"><ExternalLink size={12} /></a>
                            <button
                              type="button"
                              onClick={() => setEditDocuments((p) => ({ ...p, [dev.id]: (p[dev.id] ?? []).filter((_, j) => j !== i) }))}
                              className="text-muted-foreground/40 hover:text-red-400 transition-colors"
                            ><X size={12} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5"><Code2 size={11} /> Página de Vendas Customizada (opcional)</span>
                    </label>
                    <p className="text-muted-foreground/50 text-xs font-sans mb-2">
                      Substitui o layout padrão do lançamento. As páginas das unidades continuam no modelo do sistema.
                    </p>
                    <CustomPageEditor
                      value={customHtml}
                      type={customType}
                      onChange={(v, t) => {
                        setEditCustomHtml((p) => ({ ...p, [dev.id]: v }))
                        setEditCustomType((p) => ({ ...p, [dev.id]: t }))
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!form.is_lancamento}
                      onChange={(e) => setEditForms((p) => ({ ...p, [dev.id]: { ...p[dev.id], is_lancamento: e.target.checked } }))}
                      className="w-4 h-4 rounded accent-amber-500" />
                    <Flame size={13} className="text-amber-400" />
                    <span className="text-xs font-sans text-muted-foreground">Lançamento</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!form.is_delivered}
                      onChange={(e) => setEditForms((p) => ({ ...p, [dev.id]: { ...p[dev.id], is_delivered: e.target.checked } }))}
                      className="w-4 h-4 rounded accent-emerald-500" />
                    <CheckCircle size={13} className="text-emerald-400" />
                    <span className="text-xs font-sans text-muted-foreground">Entregue (portfólio)</span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => updateDev(dev.id)} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gold text-graphite hover:bg-gold-light disabled:opacity-50 transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg">
                    <Save size={13} /> {saving ? "Salvando..." : "Salvar"}
                  </button>
                  <button type="button" onClick={() => deleteDev(dev.id)} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 border border-red-800/40 text-red-400/60 hover:text-red-400 hover:border-red-700/60 hover:bg-red-900/10 disabled:opacity-40 transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg">
                    <Trash2 size={13} /> Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
