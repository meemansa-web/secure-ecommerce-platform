import React, { useState, useEffect, useCallback } from 'react'
import {
  Layers,
  Search,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react'
import {
  getAllAdminCategories,
  createCategory,
  updateCategory,
  activateCategory,
  deactivateCategory,
} from '../../api/adminApi'
import ConfirmationModal from '../../components/common/ConfirmationModal'
import Loading from '../../components/common/Loading'
import Button from '../../components/common/Button'
import './AdminCategoriesPage.css'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL | ACTIVE | INACTIVE
  const [toast, setToast] = useState(null)

  // Create / Edit Category Modal state
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [formErrors, setFormErrors] = useState({})
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Activate / Deactivate confirmation modal state
  const [toggleModal, setToggleModal] = useState({
    isOpen: false,
    category: null,
    action: null, // 'activate' | 'deactivate'
    loading: false,
  })

  const loadCategories = useCallback(async () => {
    try {
      const data = await getAllAdminCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch {
      setToast({ type: 'error', message: 'Unable to load categories. Please try again.' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const handleManualRefresh = () => {
    setRefreshing(true)
    loadCategories()
  }

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
    setFormErrors({})
    setFormModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || '',
      description: category.description || '',
    })
    setFormErrors({})
    setFormModalOpen(true)
  }

  const handleCloseFormModal = () => {
    if (formSubmitting) return
    setFormModalOpen(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
    setFormErrors({})
  }

  const validateForm = () => {
    const errs = {}
    if (!formData.name.trim()) {
      errs.name = 'Category name is required'
    } else if (formData.name.trim().length > 100) {
      errs.name = 'Category name must not exceed 100 characters'
    }

    if (formData.description && formData.description.length > 500) {
      errs.description = 'Description must not exceed 500 characters'
    }

    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmitCategory = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setFormSubmitting(true)

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      }

      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, payload)
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? updated : c))
        )
        setToast({
          type: 'success',
          message: 'Category updated successfully.',
        })
      } else {
        const created = await createCategory(payload)
        setCategories((prev) => [created, ...prev])
        setToast({
          type: 'success',
          message: 'Category created successfully.',
        })
      }
      handleCloseFormModal()
    } catch (err) {
      const msg = err.response?.status === 409
        ? 'Category name already exists.'
        : err.response?.data?.message || 'Failed to save category. Please check information.'
      setToast({ type: 'error', message: msg })
    } finally {
      setFormSubmitting(false)
    }
  }

  // Open Activate / Deactivate modal
  const handleOpenToggle = (category, action) => {
    setToggleModal({
      isOpen: true,
      category,
      action,
      loading: false,
    })
  }

  const handleCloseToggle = () => {
    setToggleModal({
      isOpen: false,
      category: null,
      action: null,
      loading: false,
    })
  }

  const handleConfirmToggle = async () => {
    const { category, action } = toggleModal
    if (!category || !action) return

    setToggleModal((prev) => ({ ...prev, loading: true }))

    try {
      if (action === 'deactivate') {
        const updated = await deactivateCategory(category.id)
        setCategories((prev) =>
          prev.map((c) => (c.id === category.id ? updated : c))
        )
        setToast({
          type: 'info',
          message: `Category "${category.name}" has been deactivated.`,
        })
      } else {
        const updated = await activateCategory(category.id)
        setCategories((prev) =>
          prev.map((c) => (c.id === category.id ? updated : c))
        )
        setToast({
          type: 'success',
          message: `Category "${category.name}" is now active.`,
        })
      }
      handleCloseToggle()
    } catch {
      setToggleModal((prev) => ({ ...prev, loading: false }))
      setToast({
        type: 'error',
        message: action === 'deactivate'
          ? 'Category could not be deactivated.'
          : 'Category could not be activated.',
      })
    }
  }

  // Filter categories
  const filteredCategories = categories.filter((c) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && c.active) ||
      (statusFilter === 'INACTIVE' && !c.active)

    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      (c.name || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)

    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="admin-loading-wrapper">
        <Loading text="Loading categories..." fullScreen={false} />
      </div>
    )
  }

  return (
    <div className="admin-categories-root">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Categories</h1>
          <p className="admin-page-desc">
            Organize catalog merchandise, configure customer navigation, and manage category visibility.
          </p>
        </div>

        <div className="header-actions-group">
          <Button
            type="button"
            variant="primary"
            size="md"
            icon={Plus}
            iconPosition="left"
            onClick={handleOpenCreate}
          >
            Create Category
          </Button>

          <button
            type="button"
            className={`admin-refresh-btn ${refreshing ? 'spinning' : ''}`}
            onClick={handleManualRefresh}
            disabled={refreshing}
            title="Refresh categories"
          >
            <RefreshCw size={15} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className={`admin-toast-banner toast-${toast.type}`} role="status">
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setToast(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="admin-toolbar-card">
        {/* Status Filter */}
        <div className="status-tabs-list">
          <button
            type="button"
            className={`status-tab ${statusFilter === 'ALL' ? 'tab-active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All Categories ({categories.length})
          </button>
          <button
            type="button"
            className={`status-tab ${statusFilter === 'ACTIVE' ? 'tab-active' : ''}`}
            onClick={() => setStatusFilter('ACTIVE')}
          >
            Active ({categories.filter((c) => c.active).length})
          </button>
          <button
            type="button"
            className={`status-tab ${statusFilter === 'INACTIVE' ? 'tab-active' : ''}`}
            onClick={() => setStatusFilter('INACTIVE')}
          >
            Inactive ({categories.filter((c) => !c.active).length})
          </button>
        </div>

        {/* Search */}
        <div className="admin-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search categories by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        {filteredCategories.length === 0 ? (
          <div className="admin-empty-table">
            <Layers size={36} className="empty-table-icon" />
            <p className="empty-table-title">No categories available.</p>
            <span className="empty-table-subtitle">
              {searchQuery
                ? `No category matches "${searchQuery}".`
                : 'Categories will appear here once added to organize marketplace items.'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              iconPosition="left"
              style={{ marginTop: '1.25rem' }}
              onClick={handleOpenCreate}
            >
              Create First Category
            </Button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                      {cat.name}
                    </span>
                  </td>

                  <td style={{ color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.4 }}>
                    {cat.description || '—'}
                  </td>

                  <td>
                    <span className={cat.active ? 'status-pill-active' : 'status-pill-inactive'}>
                      {cat.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="td-actions">
                    <div className="actions-cluster">
                      {/* Edit Button */}
                      <button
                        type="button"
                        className="btn-action-view"
                        onClick={() => handleOpenEdit(cat)}
                        title="Edit Category Details"
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </button>

                      {/* Activate / Deactivate */}
                      {cat.active ? (
                        <button
                          type="button"
                          className="btn-action-reject"
                          onClick={() => handleOpenToggle(cat, 'deactivate')}
                          title="Deactivate Category"
                        >
                          <XCircle size={14} />
                          <span>Deactivate</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-action-approve"
                          onClick={() => handleOpenToggle(cat, 'activate')}
                          title="Activate Category"
                        >
                          <CheckCircle2 size={14} />
                          <span>Activate</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal Dialog */}
      {formModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseFormModal}>
          <div
            className="modal-dialog"
            style={{ maxWidth: '540px', textAlign: 'left', alignItems: 'stretch' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={handleCloseFormModal}
              disabled={formSubmitting}
            >
              <X size={18} />
            </button>

            <div style={{ marginBottom: '1.25rem' }}>
              <h3 className="modal-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {editingCategory
                  ? 'Update category information. Active status is managed from the table.'
                  : 'Add a new merchandise category to organize marketplace items.'}
              </p>
            </div>

            <form onSubmit={handleSubmitCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Category Name */}
              <div>
                <label className="admin-form-label" htmlFor="cat-name">
                  Category Name <span style={{ color: '#df5848' }}>*</span>
                </label>
                <input
                  id="cat-name"
                  type="text"
                  className={`admin-form-input ${formErrors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Silk Scarves & Wraps"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: null }))
                  }}
                  maxLength={100}
                  disabled={formSubmitting}
                  autoFocus
                />
                {formErrors.name && (
                  <span className="admin-form-error">{formErrors.name}</span>
                )}
                <span className="admin-char-count">{formData.name.length}/100</span>
              </div>

              {/* Description */}
              <div>
                <label className="admin-form-label" htmlFor="cat-desc">
                  Description <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Optional)</span>
                </label>
                <textarea
                  id="cat-desc"
                  rows={3}
                  className={`admin-form-textarea ${formErrors.description ? 'input-error' : ''}`}
                  placeholder="Provide a brief summary of merchandise in this category..."
                  value={formData.description}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                    if (formErrors.description) setFormErrors((prev) => ({ ...prev, description: null }))
                  }}
                  maxLength={500}
                  disabled={formSubmitting}
                />
                {formErrors.description && (
                  <span className="admin-form-error">{formErrors.description}</span>
                )}
                <span className="admin-char-count">{formData.description.length}/500</span>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={handleCloseFormModal}
                  disabled={formSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={formSubmitting}
                >
                  {formSubmitting
                    ? 'Saving...'
                    : editingCategory
                    ? 'Save Changes'
                    : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Activate / Deactivate */}
      <ConfirmationModal
        isOpen={toggleModal.isOpen}
        title={
          toggleModal.action === 'deactivate'
            ? 'Deactivate Category?'
            : 'Activate Category?'
        }
        message={
          toggleModal.action === 'deactivate' ? (
            <span>
              Are you sure you want to deactivate category <strong>{toggleModal.category?.name}</strong>?
            </span>
          ) : (
            <span>
              Are you sure you want to activate category <strong>{toggleModal.category?.name}</strong>?
            </span>
          )
        }
        confirmText={toggleModal.action === 'deactivate' ? 'Deactivate' : 'Activate'}
        confirmVariant={toggleModal.action === 'deactivate' ? 'danger' : 'success'}
        onConfirm={handleConfirmToggle}
        onCancel={handleCloseToggle}
        loading={toggleModal.loading}
      />
    </div>
  )
}
