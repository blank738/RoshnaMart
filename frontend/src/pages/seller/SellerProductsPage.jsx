import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Plus, Edit2, Trash2, Edit3, CheckCircle2, 
  AlertCircle, Star, Search, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { sellerService } from '../../services/sellerService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/Modal';
import { ConfirmModal } from '../../components/ConfirmModal';

export const SellerProductsPage = () => {
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Stock edit modal
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newStockQty, setNewStockQty] = useState(0);
  const [updatingStock, setUpdatingStock] = useState(false);

  // Deactivate confirm modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async (p = 0) => {
    try {
      setLoading(true);
      const data = await sellerService.getProducts(p, 10);
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setPage(p);
    } catch (err) {
      console.error('Failed to load products:', err);
      showToast('Failed to load your catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(0);
  }, []);

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setNewStockQty(product.quantity || 0);
    setStockModalOpen(true);
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setUpdatingStock(true);
      const updated = await sellerService.updateStock(selectedProduct.id, Number(newStockQty));
      setProducts((prev) =>
        prev.map((p) => (p.id === selectedProduct.id ? { ...p, quantity: updated.quantity, status: updated.status } : p))
      );
      showToast(`Stock updated for ${selectedProduct.name}`, 'success');
      setStockModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update stock', 'error');
    } finally {
      setUpdatingStock(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await sellerService.deleteProduct(deleteTarget.id);
      showToast(`Product "${deleteTarget.name}" deactivated`, 'info');
      setDeleteTarget(null);
      fetchProducts(page);
    } catch (err) {
      showToast('Failed to deactivate product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status, quantity) => {
    if (quantity <= 0 || status === 'OUT_OF_STOCK') {
      return <span className="badge badge-danger text-[10px] uppercase font-bold">Out of Stock</span>;
    }
    if (status === 'PENDING_APPROVAL') {
      return <span className="badge badge-warning text-[10px] uppercase font-bold">Pending Review</span>;
    }
    if (status === 'ACTIVE') {
      return <span className="badge badge-success text-[10px] uppercase font-bold">Active</span>;
    }
    return <span className="badge badge-info text-[10px] uppercase font-bold">{status}</span>;
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Manage Products</h1>
          <p className="text-xs text-slate-500 mt-1">
            {totalElements} products listed under your merchant catalog
          </p>
        </div>
        <Link
          to="/seller/products/new"
          className="btn btn-primary btn-sm font-bold flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} /> Add New Product
        </Link>
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading catalog items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Package size={32} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No products listed yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Start expanding your store by adding your first product with rich photos, description, and competitive pricing!
            </p>
          </div>
          <Link to="/seller/products/new" className="btn btn-primary btn-sm inline-flex items-center gap-1.5">
            <Plus size={14} /> Add Product Now
          </Link>
        </div>
      ) : (
        <div className="card rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Regular / Deal Price</th>
                  <th className="py-3.5 px-4">Stock Inventory</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => {
                  const hasDiscount = prod.discountPrice && prod.discountPrice < prod.price;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80'}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <Link
                              to={`/products/${prod.id}`}
                              className="font-bold text-slate-900 hover:text-emerald-600 transition block max-w-[220px] truncate"
                            >
                              {prod.name}
                            </Link>
                            <span className="text-[10px] text-slate-400 font-mono">
                              SKU: {prod.sku || `PROD-${prod.id}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {prod.categoryName || 'General'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">
                            ₹{Number(prod.discountPrice || prod.price).toLocaleString('en-IN')}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{Number(prod.price).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              prod.quantity <= 0
                                ? 'text-red-600'
                                : prod.quantity <= 5
                                ? 'text-amber-600'
                                : 'text-slate-800'
                            }`}
                          >
                            {prod.quantity} units
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenStockModal(prod)}
                            className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition"
                            title="Quick Edit Stock"
                          >
                            <Edit3 size={13} />
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(prod.status, prod.quantity)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/seller/products/${prod.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-slate-100 transition"
                            title="Edit Product"
                          >
                            <Edit2 size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: prod.id, name: prod.name })}
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                            title="Deactivate Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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

      {/* Quick Stock Editor Modal */}
      <Modal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        title="Quick Stock Inventory Update"
      >
        <form onSubmit={handleUpdateStock} className="space-y-4">
          <p className="text-xs text-slate-600">
            Updating available inventory for{' '}
            <span className="font-bold text-slate-900">{selectedProduct?.name}</span>
          </p>

          <div className="form-group">
            <label className="form-label text-xs">Units Available in Warehouse *</label>
            <input
              type="number"
              min="0"
              required
              value={newStockQty}
              onChange={(e) => setNewStockQty(e.target.value)}
              className="form-input text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStockModalOpen(false)}
              className="btn btn-outline btn-sm text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingStock}
              className="btn btn-primary btn-sm text-xs font-bold"
            >
              {updatingStock ? 'Updating...' : 'Save Stock Count'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Deactivation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteProduct}
        title="Deactivate Product Listing?"
        message={`Are you sure you want to deactivate "${deleteTarget?.name}"? The product will be hidden from shoppers until reactivated.`}
        confirmText="Deactivate Product"
        cancelText="Keep Active"
        isDestructive={true}
        loading={deleting}
      />
    </div>
  );
};
