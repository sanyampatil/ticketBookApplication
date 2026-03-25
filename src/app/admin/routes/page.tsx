'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Map, X } from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

interface BusData { _id: string; busName: string; busNumber: string }
interface RouteData {
  _id: string; from: string; to: string; distance: number; departureTime: string
  arrivalTime: string; duration: string; fare: number; availableSeats: number
  travelDate: string; bus: BusData; isActive: boolean
}

const emptyForm = {
  from: '', to: '', distance: 0, departureTime: '08:00', arrivalTime: '12:00',
  fare: 0, travelDate: new Date().toISOString().split('T')[0], bus: '', totalSeats: 40
}

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<RouteData[]>([])
  const [buses, setBuses] = useState<BusData[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<RouteData | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchRoutes = async () => {
    setLoading(true)
    const [routesRes, busesRes] = await Promise.all([fetch('/api/routes'), fetch('/api/buses')])
    setRoutes(await routesRes.json())
    setBuses(await busesRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchRoutes() }, [])

  const computeDuration = (dep: string, arr: string) => {
    const [dh, dm] = dep.split(':').map(Number)
    const [ah, am] = arr.split(':').map(Number)
    let mins = (ah * 60 + am) - (dh * 60 + dm)
    if (mins < 0) mins += 1440
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyForm, bus: buses[0]?._id || '' })
    setModal(true)
  }

  const openEdit = (r: RouteData) => {
    setEditing(r)
    setForm({
      from: r.from, to: r.to, distance: r.distance, departureTime: r.departureTime,
      arrivalTime: r.arrivalTime, fare: r.fare,
      travelDate: new Date(r.travelDate).toISOString().split('T')[0],
      bus: r.bus._id, totalSeats: r.availableSeats
    })
    setModal(true)
  }

  const handleSave = async () => {
    if (!form.from || !form.to || !form.bus || !form.fare) return alert('Please fill all required fields')
    setSaving(true)
    try {
      const payload = {
        ...form,
        duration: computeDuration(form.departureTime, form.arrivalTime),
      }
      const url = editing ? `/api/routes/${editing._id}` : '/api/routes'
      const method = editing ? 'PUT' : 'POST'
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!r.ok) throw new Error((await r.json()).error)
      await fetchRoutes()
      setModal(false)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this route?')) return
    await fetch(`/api/routes/${id}`, { method: 'DELETE' })
    setRoutes((p) => p.filter((r) => r._id !== id))
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Routes</h1>
          <p className="text-gray-500 text-sm mt-0.5">{routes.length} active routes</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Route
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : routes.length === 0 ? (
        <div className="card text-center py-16">
          <Map className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No routes yet. Add your first route.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Route</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Timings</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Bus</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Fare</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Seats Left</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {routes.map((route) => (
                  <tr key={route._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{route.from} → {route.to}</div>
                      <div className="text-xs text-gray-400">{route.distance} km · {route.duration}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(route.travelDate)}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <span>{formatTime(route.departureTime)}</span>
                      <span className="text-gray-300 mx-1">→</span>
                      <span>{formatTime(route.arrivalTime)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <div className="font-medium text-gray-700">{route.bus?.busName}</div>
                        <div className="text-gray-400 font-mono">{route.bus?.busNumber}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatCurrency(route.fare)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${route.availableSeats <= 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {route.availableSeats}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(route)} className="p-1.5 rounded-lg hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(route._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4 animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-display font-semibold text-gray-900">{editing ? 'Edit Route' : 'Add New Route'}</h2>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">From *</label>
                  <input className="input-field" placeholder="Origin city" value={form.from}
                    onChange={(e) => setForm((p) => ({ ...p, from: e.target.value }))} />
                </div>
                <div>
                  <label className="label">To *</label>
                  <input className="input-field" placeholder="Destination city" value={form.to}
                    onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Distance (km)</label>
                  <input type="number" className="input-field" value={form.distance}
                    onChange={(e) => setForm((p) => ({ ...p, distance: parseInt(e.target.value) }))} />
                </div>
                <div>
                  <label className="label">Fare (₹) *</label>
                  <input type="number" className="input-field" value={form.fare}
                    onChange={(e) => setForm((p) => ({ ...p, fare: parseInt(e.target.value) }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Departure Time</label>
                  <input type="time" className="input-field" value={form.departureTime}
                    onChange={(e) => setForm((p) => ({ ...p, departureTime: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Arrival Time</label>
                  <input type="time" className="input-field" value={form.arrivalTime}
                    onChange={(e) => setForm((p) => ({ ...p, arrivalTime: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Travel Date *</label>
                  <input type="date" className="input-field" value={form.travelDate}
                    onChange={(e) => setForm((p) => ({ ...p, travelDate: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Total Seats</label>
                  <input type="number" className="input-field" value={form.totalSeats}
                    onChange={(e) => setForm((p) => ({ ...p, totalSeats: parseInt(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="label">Bus *</label>
                <select className="input-field" value={form.bus}
                  onChange={(e) => setForm((p) => ({ ...p, bus: e.target.value }))}>
                  <option value="">Select a bus</option>
                  {buses.map((b) => (
                    <option key={b._id} value={b._id}>{b.busName} ({b.busNumber})</option>
                  ))}
                </select>
              </div>
              <div className="bg-brand-50 rounded-xl p-3 text-xs text-brand-700">
                Computed duration: <strong>{computeDuration(form.departureTime, form.arrivalTime)}</strong>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {editing ? 'Update' : 'Add Route'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
