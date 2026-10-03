import {
  Bold,
  Code,
  Eye,
  FileCode,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  Quote,
  Split,
  Type,
} from "lucide-react";
import { useRef, useState } from "react";
import { MarkdownRenderer } from "./markdown-renderer";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Tulis materi, ringkasan, atau isi artikel di sini...",
  minHeight = "480px",
  label,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<"write" | "preview" | "split">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;

    const replacement = before + selectedText + after;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length,
      );
    }, 0);
  };

  const insertLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const newValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="aether-meta block text-ink-tertiary">{label}</label>
          <div className="flex items-center gap-2 text-[11px] text-ink-tertiary">
            <span>{wordCount} kata</span>
            <span>·</span>
            <span>~{readMinutes} mnt baca</span>
          </div>
        </div>
      )}

      <div className="glass overflow-hidden rounded-2xl border border-hairline shadow-xs">
        {/* Toolbar Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-hairline bg-surface/85 px-3 py-2 text-ink">
          {/* Action Formatting Icons */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => insertLinePrefix("# ")}
              title="Heading 1"
              className="rounded-lg p-1.5 text-ink-secondary hover:bg-neutral-200/60 hover:text-ink transition-colors"
            >
              <Heading1 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix("## ")}
              title="Heading 2"
              className="rounded-lg p-1.5 text-ink-secondary hover:bg-neutral-200/60 hover:text-ink transition-colors"
            >
              <Heading2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix("### ")}
              title="Heading 3"
              className="rounded-lg p-1.5 text-ink-secondary hover:bg-neutral-200/60 hover:text-ink transition-colors"
            >
              <Heading3 className="size-4" />
            </button>

            <span className="mx-1 h-4 w-px bg-hairline" />

            <button
              type="button"
              onClick={() => insertText("**", "**", "teks tebal")}
              title="Bold (Ctrl+B)"
              className="rounded-lg p-1.5 text-ink-secondary hover:bg-neutral-200/60 hover:text-ink transition-colors"
            >
              <Bold className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("*", "*", "teks miring")}
              title="Italic (Ctrl+I)"
              className="rounded-lg p-1.5 text-ink-secondary hover:bg-neutral-200/60 hover:text-ink transition-colors"
            >
              <Italic className="size-4" />
            </button>

            <span className="mx-1 h-4 w-px bg-hairline" />

            <button
              type="button"
              onClick={() => insertLinePrefix("- ")}
              title="Bullet List"
              className="rounded-lg p-1.5 text-ink-secondary hover:bg-neutral-200/60 hover:text-ink transition-colors"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix("1. ")}
              title="Numbered List"
              className="rounded-lg p-1.5 text-ink-secondary hover:bg-neutral-200/60 hover:text-ink transition-colors"
            >
              <ListOrdered className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix("> ")}
              title="Kutipan / Blockquote"
              className="rounded-lg p-1.5 text-ink-secondary hover:bg-neutral-200/60 hover:text-ink transition-colors"
            >
              <Quote className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("`", "`", "kode")}
              title="Inline Code"
              className="rounded-lg p-1.5 text-ink-secondary hover:bg-neutral-200/60 hover:text-ink transition-colors"
            >
              <Code className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("```javascript\n", "\n```", "// Tulis kode di sini")}
              title="Code Block"
              className="rounded-lg p-1.5 text-ink-secondary hover:bg-neutral-200/60 hover:text-ink transition-colors"
            >
              <FileCode className="size-4" />
            </button>

            <span className="mx-1 h-4 w-px bg-hairline" />

            <button
              type="button"
              onClick={() => insertText("[", "](https://link.com)", "Teks Tautan")}
              title="Sisipkan Tautan"
              className="rounded-lg p-1.5 text-ink-secondary hover:bg-neutral-200/60 hover:text-ink transition-colors"
            >
              <LinkIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("![", "](https://images.unsplash.com/...)", "Deskripsi Gambar")}
              title="Sisipkan Gambar"
              className="rounded-lg p-1.5 text-ink-secondary hover:bg-neutral-200/60 hover:text-ink transition-colors"
            >
              <ImageIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix("\n---\n")}
              title="Garis Pembatas"
              className="rounded-lg p-1.5 text-ink-secondary hover:bg-neutral-200/60 hover:text-ink transition-colors"
            >
              <Minus className="size-4" />
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 mt-1 sm:mt-0">
            <button
              type="button"
              onClick={() => setViewMode("write")}
              className={`rounded-pill px-2.5 py-1 text-[11px] font-semibold transition-all ${
                viewMode === "write"
                  ? "bg-accent text-white shadow-xs"
                  : "text-ink-secondary hover:text-ink hover:bg-neutral-100"
              }`}
            >
              Tulis
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`rounded-pill px-2.5 py-1 text-[11px] font-semibold transition-all ${
                viewMode === "preview"
                  ? "bg-accent text-white shadow-xs"
                  : "text-ink-secondary hover:text-ink hover:bg-neutral-100"
              }`}
            >
              Pratinjau
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`hidden md:inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-semibold transition-all ${
                viewMode === "split"
                  ? "bg-accent text-white shadow-xs"
                  : "text-ink-secondary hover:text-ink hover:bg-neutral-100"
              }`}
            >
              <Split className="size-3" />
              Split
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 divide-y md:divide-y-0 md:divide-x divide-hairline" style={{ minHeight }}>
          {/* Write Pane */}
          {(viewMode === "write" || viewMode === "split") && (
            <div className={viewMode === "split" ? "col-span-1" : "w-full"}>
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{ minHeight }}
                className="w-full resize-y bg-transparent p-4 font-mono text-[13.5px] leading-relaxed text-ink focus:outline-none placeholder:text-ink-tertiary"
              />
            </div>
          )}

          {/* Preview Pane */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div
              className={`p-4 overflow-y-auto bg-surface/40 ${
                viewMode === "split" ? "col-span-1" : "w-full"
              }`}
              style={{ minHeight }}
            >
              {value.trim() ? (
                <MarkdownRenderer content={value} />
              ) : (
                <div className="flex h-full min-h-[160px] flex-col items-center justify-center text-center text-ink-tertiary">
                  <Eye className="size-6 text-accent/40 mb-2" />
                  <p className="text-[13px]">Pratinjau artikel atau materi akan tampil rapi di sini.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
