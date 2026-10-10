
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = {
  title: '',
  description: '',
  price: 0,
  category: 'other',
  condition: 'used',
  status: 'active',
}

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Load the existing listing when editing.
  useEffect(() => {
    if (!id) {
      setForm(defaults)
      return
    }

    async function loadListing() {
      try {
        setLoading(true)
        setError('')

        const res = await api.get(`/listings/${id}`)
        const listing = res.data.listing

        setForm({
          title: listing.title,
          description: listing.description || '',
          price: listing.price,
          category: listing.category,
          condition: listing.condition,
          status: listing.status === 'sold' ? 'sold' : 'active',
        })
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load listing'
        )
      } finally {
        setLoading(false)
      }
    }

    loadListing()
  }, [id])

  // Update the changed field and keep price numeric.
  function onChange(e) {
    const { name, value } = e.target

    setForm((previous) => ({
      ...previous,
      [name]:
        name === 'price'
          ? value === ''
            ? ''
            : Number(value)
          : value,
    }))
  }

  // Create a listing or update the existing one.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      if (id) {
        await api.patch(`/listings/${id}`, form)
      } else {
        await api.post('/listings', form)
      }

      nav('/listings')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save listing'
      )
    }
  }

  if (loading) {
    return <div className="max-w-lg mx-auto card">Loading listing...</div>
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">
        {id ? 'Edit Listing' : 'New Listing'}
      </h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="title" className="block mb-1">Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={onChange}
            required
            minLength={2}
            className="input w-full"
            placeholder="Calculus textbook"
          />
        </div>

        <div>
          <label htmlFor="price" className="block mb-1">Price</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="any"
            value={form.price}
            onChange={onChange}
            required
            className="input w-full"
          />
        </div>

        <div>
          <label htmlFor="category" className="block mb-1">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={onChange}
            required
            className="input w-full"
          >
            <option value="textbooks">Textbooks</option>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
            <option value="clothing">Clothing</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="condition" className="block mb-1">Condition</label>
          <select
            id="condition"
            name="condition"
            value={form.condition}
            onChange={onChange}
            required
            className="input w-full"
          >
            <option value="new">New</option>
            <option value="like-new">Like New</option>
            <option value="used">Used</option>
            <option value="worn">Worn</option>
          </select>
        </div>

        {id && (
          <div>
            <label htmlFor="status" className="block mb-1">Status</label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={onChange}
              className="input w-full"
            >
              <option value="active">Active</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="description" className="block mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={onChange}
            className="input w-full"
            rows={4}
            placeholder="Describe your item..."
          />
        </div>

        {error && (
          <div role="alert" className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <button className="btn" type="submit">
          Save
        </button>
      </form>
    </div>
  )
}
