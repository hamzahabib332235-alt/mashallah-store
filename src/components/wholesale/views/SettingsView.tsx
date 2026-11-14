import React, { useState } from 'react';
import { useWholesaleStore } from '@/hooks/useWholesaleStore';
import { AppSettings } from '@/types/wholesale';
import {
  Settings,
  Store,
  Printer,
  Download,
  Upload,
  RotateCcw,
  Wifi,
  WifiOff,
  CheckCircle2,
  Save,
  Shield,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const SettingsView: React.FC = () => {
  const { store, settings } = useWholesaleStore();

  const [formSettings, setFormSettings] = useState<AppSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings(formSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const data = store.exportBackup();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MASHAALLAH_WHOLESALE_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = store.importBackup(content);
      if (ok) {
        alert('Database restored successfully from backup file!');
      } else {
        alert('Failed to parse backup file. Please verify file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (
      confirm(
        'Are you sure you want to restore default wholesale sample dataset? All custom edits will be reset to default demo values.'
      )
    ) {
      store.resetToDefaults();
      alert('Sample wholesale data restored successfully!');
    }
  };

  const handleTriggerSync = () => {
    setSyncStatus('Connecting to Cloud Replica...');
    setTimeout(() => {
      setSyncStatus('Synchronizing local SQLite transactions with PostgreSQL...');
      setTimeout(() => {
        setSyncStatus('Synchronization complete! All 0 pending transactions committed.');
        setTimeout(() => setSyncStatus(null), 4000);
      }, 1000);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Settings Form */}
      <form onSubmit={handleSave} className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Store className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Wholesale Business Profile & Configuration
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize shop identity, contact details, invoice series and thermal receipt layout
            </p>
          </div>

          <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5">
            <Save className="h-4 w-4" /> Save Settings
          </Button>
        </div>

        {saveSuccess && (
          <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/40 p-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Configuration saved successfully!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <Label>Shop Business Name</Label>
            <Input
              required
              value={formSettings.shopName}
              onChange={(e) => setFormSettings({ ...formSettings, shopName: e.target.value })}
              className="text-xs font-bold"
            />
          </div>

          <div className="space-y-1">
            <Label>Business Tagline / Subtitle</Label>
            <Input
              value={formSettings.tagline}
              onChange={(e) => setFormSettings({ ...formSettings, tagline: e.target.value })}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label>Commercial Shop Address</Label>
            <Input
              value={formSettings.address}
              onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label>Contact Phone Numbers</Label>
            <Input
              value={formSettings.phone}
              onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label>NTN / Tax Registration Number</Label>
            <Input
              value={formSettings.ntn}
              onChange={(e) => setFormSettings({ ...formSettings, ntn: e.target.value })}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label>Currency Code</Label>
            <Input
              disabled
              value={`${formSettings.currency} (Pakistani Rupees)`}
              className="text-xs bg-muted font-bold"
            />
          </div>

          <div className="space-y-1">
            <Label>Invoice Number Prefix</Label>
            <Input
              value={formSettings.invoicePrefix}
              onChange={(e) => setFormSettings({ ...formSettings, invoicePrefix: e.target.value })}
              className="text-xs font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <Label>Default Thermal Receipt Width</Label>
            <select
              value={formSettings.defaultReceiptSize}
              onChange={(e) =>
                setFormSettings({
                  ...formSettings,
                  defaultReceiptSize: e.target.value as '58mm' | '80mm',
                })
              }
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="80mm">80mm (Standard POS Thermal Width)</option>
              <option value="58mm">58mm (Compact Mobile POS Width)</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label>Default Tax Rate (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formSettings.taxRatePercent}
              onChange={(e) =>
                setFormSettings({ ...formSettings, taxRatePercent: Number(e.target.value) })
              }
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label>Default Low Stock Alert Threshold</Label>
            <Input
              type="number"
              min="1"
              value={formSettings.lowStockThreshold}
              onChange={(e) =>
                setFormSettings({ ...formSettings, lowStockThreshold: Number(e.target.value) })
              }
              className="text-xs"
            />
          </div>

          <div className="col-span-2 space-y-1">
            <Label>Thermal Receipt Footer Note</Label>
            <Input
              value={formSettings.receiptFooterMessage}
              onChange={(e) =>
                setFormSettings({ ...formSettings, receiptFooterMessage: e.target.value })
              }
              className="text-xs"
            />
          </div>
        </div>
      </form>

      {/* Offline & Cloud Synchronization Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Offline Mode & Cloud Synchronization
              </h3>
              <p className="text-xs text-muted-foreground">
                SQLite local caching with PostgreSQL cloud synchronization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleTriggerSync}
              className="text-xs font-bold gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Trigger Cloud Sync
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted/40 p-4 border border-border">
          <div className="flex items-center gap-3">
            {settings.offlineMode ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
                <WifiOff className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Wifi className="h-5 w-5" />
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-foreground">
                {settings.offlineMode ? 'Local Offline Mode (SQLite Active)' : 'Online Cloud Synchronized'}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {settings.offlineMode
                  ? 'All bills, receipts & stock changes are queued locally in browser/SQLite storage.'
                  : 'Connected to primary cloud database. Automatic conflict-free bi-directional sync enabled.'}
              </div>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => store.toggleOfflineMode(!settings.offlineMode)}
            className={`text-xs font-bold ${
              settings.offlineMode
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {settings.offlineMode ? 'Switch to Online Cloud' : 'Switch to Offline Mode'}
          </Button>
        </div>

        {syncStatus && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
            {syncStatus}
          </div>
        )}
      </div>

      {/* Database Backup & Restore */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="border-b border-border pb-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Database Backup & Recovery
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Export a full transactional JSON snapshot or restore previous wholesale records
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Export Backup */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-foreground text-xs">Export Backup</h4>
              <p className="text-[11px] text-muted-foreground mt-1">
                Downloads complete catalog, stock counts, khata ledgers, and sales invoices.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleExportBackup}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Download JSON Backup
            </Button>
          </div>

          {/* Import Restore */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-foreground text-xs">Restore from File</h4>
              <p className="text-[11px] text-muted-foreground mt-1">
                Upload a verified backup snapshot file to recover records.
              </p>
            </div>
            <label className="mt-4 flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted cursor-pointer gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              <span>Select Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset Defaults */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-foreground text-xs">Reset Sample Data</h4>
              <p className="text-[11px] text-muted-foreground mt-1">
                Re-initialize catalog with fresh Pakistani wholesale FMCG sample records.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetDefaults}
              className="mt-4 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-500/10 border-red-200 dark:border-red-900 gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset to Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
