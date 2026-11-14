import React, { useState } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import { Category } from '@/types/wholesale';
import { Layers, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const CategoriesView: React.FC = () => {
  const { store, categories, products } = useWholesaleStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      store.updateCategory(editingCategory.id, { name, description });
    } else {
      store.addCategory({ name, description });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, catName: string) => {
    const hasProducts = products.some((p) => p.categoryId === id);
    if (hasProducts) {
      alert(`Cannot delete category "${catName}" because products are currently assigned to it.`);
      return;
    }
    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
      store.deleteCategory(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Add button */}
      <div className="flex items-center justify-between rounded-xl bg-card border border-border p-4 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-foreground">Product Categories</h3>
          <p className="text-xs text-muted-foreground">
            Manage wholesale inventory classifications
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = products.filter((p) => p.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs hover:border-emerald-500/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Layers className="h-4 w-4" />
                    </span>
                    <h4 className="font-bold text-foreground text-sm">{cat.name}</h4>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                    {count} products
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenEdit(cat)}
                  className="h-7 text-xs gap-1"
                >
                  <Edit2 className="h-3 w-3" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="h-7 text-xs text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <Label>Category Name</Label>
                <Input
                  required
                  placeholder="e.g. Rice & Grains"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label>Description</Label>
                <textarea
                  rows={3}
                  placeholder="Items included under this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-border bg-background p-2 text-xs text-foreground focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
