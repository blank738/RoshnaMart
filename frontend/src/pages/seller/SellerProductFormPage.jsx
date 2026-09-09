import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Package, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { sellerService } from '../../services/sellerService';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';

export const SellerProductFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    discountPrice: '',
    quantity: '',
    sku: '',
    imageUrl: '',
    status: 'ACTIVE',
  });

  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    productService.getCategories()
      .then((data) => setCategories(data || []))
      .catch((err) => console.error(err));

    if (isEdit) {
      sellerService.getProductDetails(id)
        .then((data) => {
          setFormData({
            name: data.name || '',
            description: data.description || '',
            categoryId: data.categoryId || '',
            price: data.price || '',
            discountPrice: data.discountPrice || '',
            quantity: data.quantity || '',
            sku: data.sku || '',
            imageUrl: data.imageUrl || '',
            status: data.status || 'ACTIVE',
          });
        })
        .catch((err) => {
          console.error(err);
          showToast('Product not found', 'error');
          navigate('/seller/products');
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      setUploadingImage(true);
      const res = await sellerService.uploadImage(data);
      setFormData((prev) => ({ ...prev, imageUrl: res.imageUrl || res.url }));
      showToast('Image uploaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to upload image file', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const calculateDiscountPercent = () => {
    const p = parseFloat(formData.price);
    const d = parseFloat(formData.discountPrice);
    if (p > 0 && d > 0 && d < p) {
      return Math.round(((p - d) / p) * 100);
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId || !formData.price || !formData.quantity) {
      showToast('Please fill all mandatory fields marked *', 'warning');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        categoryId: Number(formData.categoryId),
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        quantity: Number(formData.quantity),
        sku: formData.sku.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        status: formData.status,
      };

      if (isEdit) {
        await sellerService.updateProduct(id, payload);
        showToast('Product updated successfully!', 'success');
      } else {
        await sellerService.createProduct(payload);
        showToast('Product created successfully!', 'success');
      }
      navigate('/seller/products');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save product';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const discountPercent = calculateDiscountPercent();

  if (initialLoading) {
    return (
      <div className="container py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">Loading product information...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6 max-w-4xl">
      {/* Top Bar */}
      <div className="flex items-center gap-2">
        <Link
          to="/seller/products"
          className="text-xs font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1.5"
        >
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {isEdit ? 'Edit Product Listing' : 'List a New Product'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Specify accurate specs, high resolution photos, and competitive marketplace pricing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Package size={16} className="text-emerald-600" /> Basic Information
          </h3>

          <div className="form-group">
            <label className="form-label text-xs">Product Title *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Sony WH-1000XM5 Wireless Noise Cancelling Headphones"
              className="form-input text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label text-xs">Category *</label>
              <select
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
                className="form-input text-xs"
              >
                <option value="">Select a Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Custom SKU (Stock Keeping Unit)</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. ELEC-SONY-001"
                className="form-input text-xs uppercase"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Product Description *</label>
            <textarea
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide complete product specifications, materials, warranty, and package contents..."
              className="form-input text-xs"
            />
          </div>
        </div>

        {/* Pricing & Stock Inventory */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Pricing & Warehouse Inventory
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label text-xs">Regular MRP Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 2999"
                className="form-input text-xs"
              />
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Discount / Deal Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                placeholder="e.g. 2499 (Optional)"
                className="form-input text-xs"
              />
              {discountPercent > 0 && (
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                  🎉 {discountPercent}% Discount to shoppers
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Available Stock (Units) *</label>
              <input
                type="number"
                min="0"
                name="quantity"
                required
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g. 25"
                className="form-input text-xs"
              />
            </div>
          </div>
        </div>

        {/* Photos & Media */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon size={16} className="text-emerald-600" /> Product Image
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="space-y-3">
              <div className="form-group">
                <label className="form-label text-xs">Image URL (CDN / Unsplash / Direct link)</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="form-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="form-label text-xs">Or Upload Local Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="form-input text-xs"
                />
                {uploadingImage && (
                  <span className="text-[10px] text-emerald-600 font-semibold">Uploading to server...</span>
                )}
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center min-h-[160px]">
              {formData.imageUrl ? (
                <div className="space-y-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-32 h-32 rounded-xl object-cover border border-slate-200 mx-auto shadow-sm"
                  />
                  <span className="text-[10px] text-slate-500">Live Image Preview</span>
                </div>
              ) : (
                <div className="text-slate-400 space-y-1">
                  <ImageIcon size={32} className="mx-auto" />
                  <p className="text-xs">No image specified yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-bold text-xs text-slate-900 block">Listing Status</span>
            <span className="text-[11px] text-slate-500">
              Active listings are visible to buyers across search and categories.
            </span>
          </div>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-input text-xs max-w-[150px]"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link to="/seller/products" className="btn btn-outline btn-sm text-xs">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="btn btn-primary btn-sm text-xs font-bold px-6 shadow-md flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Product...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>{isEdit ? 'Update Product' : 'List Product'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
