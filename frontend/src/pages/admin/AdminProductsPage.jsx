import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Store, Star, CheckCircle2, XCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

export const AdminProductsPage = () => {
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  const fetchProducts = async (p = 0, status = activeStatus, q = search) => {
    try {
      setLoading(true);
      const params = { page: p, size: 10 };
      if (status !== 'ALL') params.status = status;
      if (q.trim()) params.search = q.trim();

      const data = await adminService.getProducts(params);
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setPage(p);
    } catch (err) {
      console.error('Failed to load products:', err);
      showToast('Failed to load platform catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(0, activeStatus, search);
  }, [activeStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(0, activeStatus, search);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      setBusyId(id);
      await adminService.updateProductStatus(id, nextStatus);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
      );
      showToast(`Product marked as ${nextStatus}`, 'success');
    } catch (err) {
      showToast('Failed to update product status', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge badge-success text-[10px] uppercase font-bold">Active</span>;
      case 'PENDING_APPROVAL':
        return <span className="badge badge-warning text-[10px] uppercase font-bold">Pending Approval</span>;
      case 'OUT_OF_STOCK':
        return <span className="badge badge-danger text-[10px] uppercase font-bold">Out of Stock</span>;
      default:
        return <span className="badge badge-info text-[10px] uppercase font-bold">{status}</span>;
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Platform Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            {totalElements} total products across all merchant stores
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'ACTIVE', 'PENDING_APPROVAL', 'INACTIVE', 'OUT_OF_STOCK'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveStatus(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeStatus === tab
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-sm w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by keyword..."
            className="form-input text-xs py-1.5"
          />
          <button type="submit" className="btn btn-outline btn-sm text-xs font-bold">
            <Search size={14} />
          </button>
        </form>
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading catalog items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Package size={32} className="mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">No products matched criteria</h3>
        </div>
      ) : (
        <div className="card rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => {
                  const isBusy = busyId === prod.id;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80'}
                            alt={prod.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <Link
                              to={`/products/${prod.id}`}
                              className="font-bold text-slate-900 hover:text-emerald-600 block max-w-[200px] truncate"
                            >
                              {prod.name}
                            </Link>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {prod.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-semibold">
                        <div className="flex items-center gap-1">
                          <Store size={12} className="text-emerald-600" />
                          <span className="max-w-[150px] truncate">
                            {prod.sellerBusinessName || 'Vendor'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {prod.categoryName || 'General'}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{Number(prod.discountPrice || prod.price).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {prod.quantity} units
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(prod.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleToggleStatus(prod.id, prod.status)}
                          className={`btn btn-outline btn-sm text-[11px] font-bold py-1 px-2.5 rounded-lg ${
                            prod.status === 'ACTIVE'
                              ? 'text-red-600 border-red-200 hover:bg-red-50'
                              : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          {prod.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => fetchProducts(page - 1)}
                  className="btn btn-outline btn-sm px-2.5 py-1 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => fetchProducts(page + 1)}
                  className="btn btn-outline btn-sm px-2.5 py-1 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
