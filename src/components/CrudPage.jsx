import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import AppLayout from './AppLayout';

const resolveValue = (item, path) => path.split('.').reduce((value, key) => (value == null ? value : value[key]), item);

const CrudPage = ({ title, endpoint, fields, columns, initialForm, subtitle, readOnly = false }) => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const endpointLabel = useMemo(() => endpoint.replace('/', ''), [endpoint]);

  const loadItems = async () => {
    const response = await api.get(endpoint);
    setItems(response.data);
    setLoading(false);
  };

  useEffect(() => {
    loadItems().catch((loadError) => {
      setError(loadError.response?.data?.message || `Unable to load ${endpointLabel}`);
      setLoading(false);
    });
  }, [endpointLabel]);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.put(`${endpoint}/${editingId}`, form);
        setSuccess(`${title} updated`);
      } else {
        await api.post(endpoint, form);
        setSuccess(`${title} created`);
      }

      resetForm();
      await loadItems();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Something went wrong');
    }
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...initialForm, ...item });
  };

  const onDelete = async (item) => {
    try {
      await api.delete(`${endpoint}/${item.id}`);
      setSuccess(`${title} deleted`);
      await loadItems();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <AppLayout title={title}>
      <div className={`page-grid ${readOnly ? 'page-grid-readonly' : ''}`}>
        {!readOnly ? (
          <section className="panel panel-form">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Manage records</p>
                <h2>{editingId ? `Edit ${title}` : `Add ${title}`}</h2>
                {subtitle ? <p className="muted">{subtitle}</p> : null}
              </div>
            </div>

            {error ? <div className="alert error">{error}</div> : null}
            {success ? <div className="alert success">{success}</div> : null}

            <form className="stack-form" onSubmit={onSubmit}>
              {fields.map((field) => (
                <label key={field.name} className="field">
                  <span>{field.label}</span>
                  {field.type === 'textarea' ? (
                    <textarea name={field.name} value={form[field.name] ?? ''} onChange={onChange} rows={field.rows || 4} placeholder={field.placeholder || ''} />
                  ) : field.type === 'select' ? (
                    <select name={field.name} value={form[field.name] ?? ''} onChange={onChange}>
                      <option value="">Select...</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <input name={field.name} type="checkbox" checked={Boolean(form[field.name])} onChange={onChange} />
                  ) : (
                    <input name={field.name} type={field.type || 'text'} value={form[field.name] ?? ''} onChange={onChange} placeholder={field.placeholder || ''} />
                  )}
                </label>
              ))}

              <div className="form-actions">
                <button type="submit" className="primary-button">{editingId ? 'Update' : 'Save'}</button>
                <button type="button" className="secondary-button" onClick={resetForm}>Reset</button>
              </div>
            </form>
          </section>
        ) : error ? <div className="alert error">{error}</div> : null}

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Current data</p>
              <h2>{title} list</h2>
            </div>
            <button type="button" className="ghost-button" onClick={loadItems}>Refresh</button>
          </div>

          {loading ? <div className="empty-state">Loading data...</div> : null}

          {!loading && items.length === 0 ? <div className="empty-state">No records yet.</div> : null}

          {!loading && items.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {columns.map((column) => <th key={column.key}>{column.label}</th>)}
                    {!readOnly ? <th>Actions</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      {columns.map((column) => (
                        <td key={column.key}>{column.formatter ? column.formatter(item) : resolveValue(item, column.key)}</td>
                      ))}
                      {!readOnly ? (
                        <td>
                          <div className="row-actions">
                            <button type="button" className="link-button" onClick={() => onEdit(item)}>Edit</button>
                            <button type="button" className="link-button danger" onClick={() => onDelete(item)}>Delete</button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </AppLayout>
  );
};

export default CrudPage;
