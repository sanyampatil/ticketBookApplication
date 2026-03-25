'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Bus, X, CheckCircle } from 'lucide-react'

interface BusData {
  _id: string
  busName: string
  busNumber: string
  busType: string
  totalSeats: number
  amenities: string[]
  isActive: boolean
}

const BUS_TYPES = ['Volvo AC', 'AC Sleeper', 'Non-AC Sleeper', 'AC Seater', 'Non-AC Seater']
const ALL_AMENITIES = ['WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'GPS Tracking', 'Reading Light', 'Entertainment', 'First Aid Kit']

const emptyForm = { busName: '', busNumber: '', busType: 'Volvo AC', totalSeats: 40, amenities: [] as string[] }

export default function AdminBusesPage() {
  const [buses, setBuses] = useState<BusData[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<BusData | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchBuses = async () => {
    setLoading(true)
    const r = await fetch('/api/buses')
    const d = await r.json()
    setBuses(d)
    setLoading(false)
  }

  useEffect(() => { fetchBuses() }, [])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit = (bus: BusData) => {
    setEditing(bus)
    setForm({ busName: bus.busName, busNumber: bus.busNumber, busType: bus.busType, totalSeats: bus.totalSeats, amenities: bus.amenities || [] })
    setModal(true)
  }

  const toggleAmenity = (a: string) => {
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(a) ? p.amenities.filter((x) => x !== a) : [...p.amenities, a],
    }))
  }

  const handleSave = async () => {
    if (!form.busName || !form.busNumber) return
    setSaving(true)
    try {
      const url = editing ? `/api/buses/${editing._id}` : '/api/buses'
      const method = editing ? 'PUT' : 'POST'
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!r.ok) throw new Error((await r.json()).error)
      await fetchBuses()
      setModal(false)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this bus?')) return
    await fetch(`/api/buses/${id}`, { method: 'DELETE' })
    setBuses((p) => p.filter((b) => b._id !== id))
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Buses</h1>
          <p className="text-gray-500 text-sm mt-0.5">{buses.length} buses registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add Bus
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : buses.length === 0 ? (
        <div className="card text-center py-16">
          <Bus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No buses yet. Add your first bus.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {buses.map((bus) => (
            <div key={bus._id} className="card hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                    <Bus className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{bus.busName}</p>
                    <p className="text-xs text-gray-400 font-mono">{bus.busNumber}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(bus)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-brand-600 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(bus._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                <div className="flex justify-between">
                  <span>Type</span>
                  <span className="font-medium text-gray-700">{bus.busType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Seats</span>
                  <span className="font-medium text-gray-700">{bus.totalSeats}</span>
                </div>
              </div>

              {bus.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {bus.amenities.slice(0, 3).map((a) => (
                    <span key={a} className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100">{a}</span>
                  ))}
                  {bus.amenities.length > 3 && (
                    <span className="text-xs text-gray-400">+{bus.amenities.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-display font-semibold text-gray-900">{editing ? 'Edit Bus' : 'Add New Bus'}</h2>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="label">Bus Name</label>
                <input className="input-field" placeholder="e.g. Maharashtra Express" value={form.busName}
                  onChange={(e) => setForm((p) => ({ ...p, busName: e.target.value }))} />
              </div>
              <div>
                <label className="label">Bus Number</label>
                <input className="input-field uppercase" placeholder="e.g. MH-12-AB-1234" value={form.busNumber}
                  onChange={(e) => setForm((p) => ({ ...p, busNumber: e.target.value.toUpperCase() }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Bus Type</label>
                  <select className="input-field" value={form.busType}
                    onChange={(e) => setForm((p) => ({ ...p, busType: e.target.value }))}>
                    {BUS_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Total Seats</label>
                  <input type="number" className="input-field" min="10" max="60" value={form.totalSeats}
                    onChange={(e) => setForm((p) => ({ ...p, totalSeats: parseInt(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="label">Amenities</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ALL_AMENITIES.map((a) => {
                    const selected = form.amenities.includes(a)
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${
                          selected ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                        }`}
                      >
                        {selected && <CheckCircle className="w-3 h-3" />}
                        {a}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {editing ? 'Update' : 'Add Bus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
