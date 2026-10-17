"use client";

import {
  Bold,
  Code,
  Eye,
  Heading1,
  Heading2,
  Italic,
  Link,
  List,
  ListOrdered,
  RemoveFormatting,
  Underline,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/atoms";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  variables?: string[];
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  variables = [],
  placeholder = "Escribe el contenido HTML de la notificación...",
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"visual" | "code" | "preview">("visual");
  const [codeValue, setCodeValue] = useState(value);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (editorRef.current && mode === "visual" && !isUpdatingRef.current) {
      if (document.activeElement !== editorRef.current && editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, mode]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    if (mode !== "visual") return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      isUpdatingRef.current = true;
      onChange(html);
      setCodeValue(html);
      isUpdatingRef.current = false;
    }
  };

  const handleVisualInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      isUpdatingRef.current = true;
      onChange(html);
      setCodeValue(html);
      isUpdatingRef.current = false;
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCodeValue(val);
    onChange(val);
  };

  const insertVariable = (varName: string) => {
    const varText = `{{${varName}}}`;
    if (mode === "visual" && editorRef.current) {
      editorRef.current.focus();
      document.execCommand("insertText", false, varText);
      handleVisualInput();
    } else {
      const nextCode = codeValue + varText;
      setCodeValue(nextCode);
      onChange(nextCode);
    }
  };

  const addLink = () => {
    const url = prompt("Ingrese la URL del enlace:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  return (
    <div className={`border-input bg-card flex flex-col rounded-lg border shadow-xs ${className}`}>
      {/* Toolbar */}
      <div className="border-border bg-muted/40 flex flex-wrap items-center justify-between gap-1.5 border-b p-2">
        <div className="flex flex-wrap items-center gap-1">
          {mode === "visual" && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => execCommand("bold")}
                title="Negrita"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => execCommand("italic")}
                title="Cursiva"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => execCommand("underline")}
                title="Subrayado"
              >
                <Underline className="h-4 w-4" />
              </Button>
              <div className="bg-border my-1 h-4 w-[1px]" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => execCommand("formatBlock", "<h1>")}
                title="Encabezado 1"
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => execCommand("formatBlock", "<h2>")}
                title="Encabezado 2"
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <div className="bg-border my-1 h-4 w-[1px]" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => execCommand("insertUnorderedList")}
                title="Lista de viñetas"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => execCommand("insertOrderedList")}
                title="Lista numerada"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <div className="bg-border my-1 h-4 w-[1px]" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={addLink}
                title="Insertar enlace"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => execCommand("removeFormat")}
                title="Quitar formato"
              >
                <RemoveFormatting className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* View Switcher Tabs */}
        <div className="bg-muted flex items-center rounded-md p-0.5">
          <button
            type="button"
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === "visual"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setMode("visual")}
          >
            Visual
          </button>
          <button
            type="button"
            className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === "code"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setMode("code")}
          >
            <Code className="h-3 w-3" />
            HTML
          </button>
          <button
            type="button"
            className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === "preview"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setMode("preview")}
          >
            <Eye className="h-3 w-3" />
            Previsualizar
          </button>
        </div>
      </div>

      {/* Variables Quick Insert Bar */}
      {variables.length > 0 && mode !== "preview" && (
        <div className="border-border bg-muted/20 flex flex-wrap items-center gap-1.5 border-b px-3 py-1.5 text-xs">
          <span className="text-muted-foreground font-medium">Insertar variable:</span>
          {variables.map((varName) => (
            <button
              key={varName}
              type="button"
              onClick={() => insertVariable(varName)}
              className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 rounded-full border px-2 py-0.5 font-mono text-xs font-medium transition-colors"
              title={`Insertar {{${varName}}}`}
            >
              {`{{${varName}}}`}
            </button>
          ))}
        </div>
      )}

      {/* Editor Content Area */}
      <div className="relative min-h-[220px]">
        {mode === "visual" && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleVisualInput}
            onBlur={handleVisualInput}
            className="prose dark:prose-invert focus:ring-ring min-h-[220px] max-w-none p-4 outline-hidden focus:ring-1"
            data-placeholder={placeholder}
          />
        )}

        {mode === "code" && (
          <textarea
            value={codeValue}
            onChange={handleCodeChange}
            placeholder={placeholder}
            className="text-foreground focus:ring-ring min-h-[220px] w-full resize-y bg-transparent p-4 font-mono text-xs outline-hidden focus:ring-1"
            rows={10}
          />
        )}

        {mode === "preview" && (
          <div className="bg-background min-h-[220px] p-4">
            <div
              className="prose dark:prose-invert border-border bg-card min-h-[200px] max-w-none rounded-md border p-4 shadow-xs"
              dangerouslySetInnerHTML={{
                __html: value || "<p className='text-muted-foreground italic'>Contenido vacío</p>",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
