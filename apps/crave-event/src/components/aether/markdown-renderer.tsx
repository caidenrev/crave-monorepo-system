import { useMemo } from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeLanguage = "";
    let inList = false;
    let listItems: string[] = [];
    let listType: "ul" | "ol" = "ul";

    const flushList = (key: string) => {
      if (listItems.length === 0) return;
      if (listType === "ul") {
        elements.push(
          <ul key={key} className="my-3 space-y-1.5 list-disc list-inside text-ink/85">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                <InlineRenderer text={item} />
              </li>
            ))}
          </ul>,
        );
      } else {
        elements.push(
          <ol key={key} className="my-3 space-y-1.5 list-decimal list-inside text-ink/85">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                <InlineRenderer text={item} />
              </li>
            ))}
          </ol>,
        );
      }
      listItems = [];
      inList = false;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Code block start / end
      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${index}`} className="my-4 rounded-xl overflow-hidden border border-hairline bg-slate-900 text-slate-100 shadow-md">
              {codeLanguage && (
                <div className="bg-slate-800/80 px-4 py-1.5 text-[11px] font-mono font-semibold text-slate-300 border-b border-slate-700/60 uppercase">
                  {codeLanguage}
                </div>
              )}
              <pre className="p-4 text-[13px] font-mono leading-relaxed overflow-x-auto">
                <code>{codeBlockContent.join("\n")}</code>
              </pre>
            </div>,
          );
          codeBlockContent = [];
          inCodeBlock = false;
          codeLanguage = "";
        } else {
          flushList(`list-pre-${index}`);
          inCodeBlock = true;
          codeLanguage = trimmed.replace("```", "").trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Blockquote
      if (trimmed.startsWith("> ")) {
        flushList(`list-pre-${index}`);
        elements.push(
          <blockquote
            key={`quote-${index}`}
            className="my-3 border-l-4 border-accent bg-accent-tint/30 px-4 py-2.5 rounded-r-xl italic text-ink-secondary text-[14px]"
          >
            <InlineRenderer text={trimmed.slice(2)} />
          </blockquote>,
        );
        return;
      }

      // Horizontal Rule
      if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
        flushList(`list-pre-${index}`);
        elements.push(<hr key={`hr-${index}`} className="my-6 border-hairline" />);
        return;
      }

      // Unordered list
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        if (!inList || listType !== "ul") {
          flushList(`list-switch-${index}`);
          inList = true;
          listType = "ul";
        }
        listItems.push(trimmed.slice(2));
        return;
      }

      // Ordered list
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch && numMatch[2]) {
        if (!inList || listType !== "ol") {
          flushList(`list-switch-${index}`);
          inList = true;
          listType = "ol";
        }
        listItems.push(numMatch[2]);
        return;
      }

      // If we were in a list and this is not a list item, flush
      flushList(`list-flush-${index}`);

      // Headings
      if (trimmed.startsWith("# ")) {
        elements.push(
          <h1 key={`h1-${index}`} className="mt-6 mb-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            <InlineRenderer text={trimmed.slice(2)} />
          </h1>,
        );
        return;
      }
      if (trimmed.startsWith("## ")) {
        elements.push(
          <h2 key={`h2-${index}`} className="mt-5 mb-2.5 text-xl font-bold tracking-tight text-ink sm:text-2xl">
            <InlineRenderer text={trimmed.slice(3)} />
          </h2>,
        );
        return;
      }
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={`h3-${index}`} className="mt-4 mb-2 text-lg font-bold text-ink sm:text-xl">
            <InlineRenderer text={trimmed.slice(4)} />
          </h3>,
        );
        return;
      }

      // Empty line / paragraph spacing
      if (trimmed === "") {
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={`p-${index}`} className="my-2.5 leading-[1.8] text-ink/90 text-[15px]">
          <InlineRenderer text={trimmed} />
        </p>,
      );
    });

    flushList("list-final");

    return elements;
  }, [content]);

  return <div className={`markdown-content space-y-1 ${className}`}>{renderedElements}</div>;
}

/**
 * InlineRenderer handles **bold**, *italic*, `code`, [link](url), and ![image](url)
 */
function InlineRenderer({ text }: { text: string }) {
  // Check image
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match = imgRegex.exec(text);
  if (match && match[1] !== undefined && match[2] !== undefined) {
    const alt = match[1];
    const src = match[2];
    const before = text.slice(0, match.index);
    const after = text.slice(match.index + match[0].length);
    return (
      <>
        {before && <InlineRenderer text={before} />}
        <img
          src={src}
          alt={alt}
          className="my-3 rounded-xl max-h-72 w-full object-cover shadow-md border border-hairline"
        />
        {after && <InlineRenderer text={after} />}
      </>
    );
  }

  // Check links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  match = linkRegex.exec(text);
  if (match && match[1] !== undefined && match[2] !== undefined) {
    const label = match[1];
    const href = match[2];
    const before = text.slice(0, match.index);
    const after = text.slice(match.index + match[0].length);
    return (
      <>
        {before && <InlineRenderer text={before} />}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline font-semibold hover:text-accent-strong transition-colors"
        >
          {label}
        </a>
        {after && <InlineRenderer text={after} />}
      </>
    );
  }

  // Parse bold, italic, inline code with simple regex
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Italic: *text*
    const italicMatch = remaining.match(/\*(.+?)\*/);
    // Code: `code`
    const codeMatch = remaining.match(/`(.+?)`/);

    const candidates = [
      boldMatch ? { type: "bold", index: boldMatch.index!, length: boldMatch[0].length, content: boldMatch[1]! } : null,
      italicMatch ? { type: "italic", index: italicMatch.index!, length: italicMatch[0].length, content: italicMatch[1]! } : null,
      codeMatch ? { type: "code", index: codeMatch.index!, length: codeMatch[0].length, content: codeMatch[1]! } : null,
    ].filter(Boolean) as { type: string; index: number; length: number; content: string }[];

    if (candidates.length === 0) {
      parts.push(remaining);
      break;
    }

    candidates.sort((a, b) => a.index - b.index);
    const first = candidates[0]!;

    if (first.index > 0) {
      parts.push(remaining.slice(0, first.index));
    }

    if (first.type === "bold") {
      parts.push(<strong key={keyIndex++} className="font-bold text-ink">{first.content}</strong>);
    } else if (first.type === "italic") {
      parts.push(<em key={keyIndex++} className="italic text-ink/90">{first.content}</em>);
    } else if (first.type === "code") {
      parts.push(
        <code key={keyIndex++} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-accent-strong border border-slate-200">
          {first.content}
        </code>,
      );
    }

    remaining = remaining.slice(first.index + first.length);
  }

  return <>{parts}</>;
}
