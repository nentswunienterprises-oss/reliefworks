import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type ScopeRichTextProps = {
  content: string;
  className?: string;
};

function renderInlineContent(text: string) {
  const tokens = text.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`)/g).filter(Boolean);

  return tokens.map((token, index) => {
    if (
      (token.startsWith("**") && token.endsWith("**")) ||
      (token.startsWith("__") && token.endsWith("__"))
    ) {
      return (
        <strong key={`${token}-${index}`} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    }

    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={`${token}-${index}`}
          className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[0.9em] text-primary"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    return <Fragment key={`${token}-${index}`}>{token}</Fragment>;
  });
}

function renderParagraph(lines: string[]) {
  return lines.map((line, index) => (
    <Fragment key={`${line}-${index}`}>
      {renderInlineContent(line)}
      {index < lines.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

export function ScopeRichText({ content, className }: ScopeRichTextProps) {
  const normalized = content.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return null;
  }

  const lines = normalized.split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const currentLine = lines[index].trimEnd();
    const trimmedLine = currentLine.trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    const headingMatch = trimmedLine.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();
      const headingClassName =
        level === 1
          ? "font-display text-xl text-primary"
          : level === 2
            ? "font-display text-lg text-primary"
            : "text-xs uppercase tracking-[0.18em] text-primary/80";

      blocks.push(
        <p key={`heading-${index}`} className={headingClassName}>
          {renderInlineContent(headingText)}
        </p>,
      );
      index += 1;
      continue;
    }

    const bulletMatch = trimmedLine.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      const items: string[] = [];
      while (index < lines.length) {
        const listItem = lines[index].trim().match(/^[-*•]\s+(.+)$/);
        if (!listItem) {
          break;
        }
        items.push(listItem[1].trim());
        index += 1;
      }

      blocks.push(
        <ul
          key={`bullet-list-${index}`}
          className="space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-primary"
        >
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderInlineContent(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    const orderedMatch = trimmedLine.match(/^(\d+)[.)]\s+(.+)$/);
    if (orderedMatch) {
      const items: string[] = [];
      const start = Number(orderedMatch[1]);
      while (index < lines.length) {
        const listItem = lines[index].trim().match(/^\d+[.)]\s+(.+)$/);
        if (!listItem) {
          break;
        }
        items.push(listItem[1].trim());
        index += 1;
      }

      blocks.push(
        <ol
          key={`ordered-list-${index}`}
          className="space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:font-semibold marker:text-primary"
          start={start}
        >
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderInlineContent(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const line = lines[index].trimEnd();
      const trimmed = line.trim();
      if (
        !trimmed ||
        /^(#{1,3})\s+(.+)$/.test(trimmed) ||
        /^[-*•]\s+(.+)$/.test(trimmed) ||
        /^\d+[.)]\s+(.+)$/.test(trimmed)
      ) {
        break;
      }
      paragraphLines.push(trimmed);
      index += 1;
    }

    blocks.push(
      <p key={`paragraph-${index}`} className="text-sm leading-relaxed text-muted-foreground">
        {renderParagraph(paragraphLines)}
      </p>,
    );
  }

  return <div className={cn("space-y-3", className)}>{blocks}</div>;
}
