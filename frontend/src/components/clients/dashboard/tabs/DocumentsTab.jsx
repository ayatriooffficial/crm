'use client';

import { useRef, useState } from 'react';
import { DownloadIcon, ExternalLinkIcon, FileIcon, TrashIcon, UploadIcon } from '@/components/icons';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';
import { newId, useClientDashboard } from '../ClientDashboardProvider';
import { ConfirmModal, EmptyState, Panel, downloadFile, formatBytes, todayIso } from '../parts';

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 10;
const EXTENSIONS = ['csv', 'xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx', 'pdf', 'jpg', 'jpeg', 'json', 'xml', 'zip'];

function DocCard({ title, children }) {
  return (
    <Panel className="self-start">
      <header className="border-b border-divider px-5 py-7 sm:px-[2.375rem]">
        <h2 className="text-2xl text-ink sm:text-card-title">{title}</h2>
      </header>
      <div className="px-5 pb-8 pt-10 sm:px-[2.375rem]">{children}</div>
    </Panel>
  );
}

const actionButton = cx('grid size-[2.375rem] place-items-center rounded-md bg-[#eef0f3] text-ink transition-colors hover:bg-[#e2e5e9]', focusRing);

/** Dummy documents have no real file behind them, so a small text stand-in is generated. */
function fileFor(doc) {
  if (doc.blob) return doc.blob;
  return new Blob([`Sample document: ${doc.name}\n\nThis is placeholder content for the demo.`], { type: 'text/plain' });
}

export default function DocumentsTab() {
  const { data, dispatch, notify } = useClientDashboard();
  const { files, taskDocs } = data.documents;
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const addFiles = (list) => {
    const picked = Array.from(list);
    if (!picked.length) return;
    if (picked.length > MAX_FILES) {
      setError(`You can upload at most ${MAX_FILES} files at once.`);
      return;
    }
    const rejected = picked.filter((file) => file.size > MAX_BYTES || !EXTENSIONS.includes(file.name.split('.').pop().toLowerCase()));
    const accepted = picked.filter((file) => !rejected.includes(file));
    setError(rejected.length ? `Skipped ${rejected.map((file) => file.name).join(', ')} (max 10 MB, supported formats only).` : '');
    if (!accepted.length) return;
    const items = accepted.map((file) => ({ id: newId('d'), name: file.name, size: file.size, uploadedAt: todayIso(), blob: file }));
    dispatch({ type: 'documents', files: (current) => [...items, ...current] });
    notify(`${items.length} document${items.length > 1 ? 's' : ''} uploaded.`);
  };

  const open = (doc) => {
    const url = URL.createObjectURL(fileFor(doc));
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <div className="grid gap-[1.875rem] lg:grid-cols-2">
      <DocCard title="Task Doc. Directory">
        {taskDocs.length ? (
          <ul className="divide-y divide-divider">
            {taskDocs.map((doc) => (
              <li key={doc.id} className="flex items-center gap-3 py-3.5">
                <FileIcon size={18} className="shrink-0 text-ink-soft" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base text-ink">{doc.name}</p>
                  <p className="truncate text-sm text-muted">{doc.task}</p>
                </div>
                <button type="button" aria-label={`Download ${doc.name}`} onClick={() => downloadFile(doc.name, fileFor(doc))} className={actionButton}>
                  <DownloadIcon size={16} strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>There are no Documents</EmptyState>
        )}
      </DocCard>

      <DocCard title="Client Documents">
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(event.dataTransfer.files);
          }}
          className={cx(
            'flex flex-col items-center rounded-md border border-dashed border-brand px-5 py-8 text-center transition-colors',
            dragging ? 'bg-brand-soft' : 'bg-[#f7fbff] hover:bg-[#eef5fd]',
            focusRing,
          )}
        >
          <UploadIcon size={30} className="text-brand" />
          <p className="mt-3 text-[1.0625rem] text-ink">Drop files here or click to upload.</p>
          <p className="mt-6 text-sm leading-[1.35rem] text-muted">
            Maximum File Size: 10 MB (Max. 10 files at once) | File Format: CSV, XLS, XLSX, DOC, PPT, PPTX, PDF, JPG, JSON, XML, ZIP
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={EXTENSIONS.map((ext) => `.${ext}`).join(',')}
            className="hidden"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </div>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        {files.length ? (
          <ul className="mt-6">
            {files.map((doc) => (
              <li key={doc.id} className="flex items-center gap-3 border-b border-divider py-3 last:border-b-0">
                <FileIcon size={18} className="shrink-0 text-ink" />
                <span className="min-w-0 flex-1 truncate text-base text-ink" title={`${doc.name} · ${formatBytes(doc.size)}`}>
                  {doc.name}
                </span>
                <div className="flex shrink-0 gap-2.5">
                  <button type="button" aria-label={`Open ${doc.name}`} onClick={() => open(doc)} className={actionButton}>
                    <ExternalLinkIcon size={16} strokeWidth={2} />
                  </button>
                  <button type="button" aria-label={`Download ${doc.name}`} onClick={() => downloadFile(doc.name, fileFor(doc))} className={actionButton}>
                    <DownloadIcon size={16} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${doc.name}`}
                    onClick={() => setDeleting(doc)}
                    className={cx('grid size-[2.375rem] place-items-center rounded-md bg-[#fde8ea] text-[#f07a80] transition-colors hover:bg-[#fbd9dc]', focusRing)}
                  >
                    <TrashIcon size={14} strokeWidth={2} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>There are no Documents</EmptyState>
        )}
      </DocCard>

      {deleting && (
        <ConfirmModal
          title="Delete Document"
          message={`Delete "${deleting.name}"? This cannot be undone.`}
          onConfirm={() => {
            dispatch({ type: 'documents', files: (current) => current.filter((doc) => doc.id !== deleting.id) });
            setDeleting(null);
            notify('Document deleted.');
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
