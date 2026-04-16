import { useState, useRef, useEffect, useCallback } from "react";
import { Play, RefreshCw, Loader2, Maximize2, Minimize2, Code2, Monitor, Terminal, ChevronDown, Copy, Check, ArrowLeft } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

/* ── Language definitions ── */
interface LangDef {
  id: string;
  label: string;
  pistonLang?: string;
  pistonVersion?: string;
  extension: any;
  defaultCode: string;
  livePreview: boolean;
  color: string;
}

const LANGS: LangDef[] = [
  {
    id: "html",
    label: "HTML",
    extension: html(),
    livePreview: true,
    color: "text-orange-400",
    defaultCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: sans-serif; background: #0f172a; color: #e2e8f0; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    h1 { font-size: 2rem; color: #22d3ee; }
    button { background: #22d3ee; color: #0f172a; border: none; padding: 10px 24px; border-radius: 8px; font-size: 1rem; cursor: pointer; margin-top: 16px; font-weight: 600; }
    button:hover { opacity: 0.85; }
  </style>
</head>
<body>
  <div style="text-align:center">
    <h1>⚡ Luffy AI Playground</h1>
    <p>Edit this HTML and see it live!</p>
    <button onclick="alert('Hello, Sir! 🚀')">Click Me</button>
  </div>
</body>
</html>`,
  },
  {
    id: "javascript",
    label: "JavaScript",
    pistonLang: "javascript",
    pistonVersion: "18.15.0",
    extension: javascript(),
    livePreview: false,
    color: "text-yellow-400",
    defaultCode: `// JavaScript — runs in Node.js
const greet = (name) => \`Hello, \${name}! 🚀\`;

const nums = [1, 2, 3, 4, 5];
const doubled = nums.map(n => n * 2);

console.log(greet("Sir"));
console.log("Doubled:", doubled);
console.log("Sum:", nums.reduce((a, b) => a + b, 0));`,
  },
  {
    id: "python",
    label: "Python",
    pistonLang: "python",
    pistonVersion: "3.10.0",
    extension: python(),
    livePreview: false,
    color: "text-blue-400",
    defaultCode: `# Python 3.10
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        print(a, end=" ")
        a, b = b, a + b
    print()

print("Fibonacci sequence:")
fibonacci(10)

# List comprehension
squares = [x**2 for x in range(1, 6)]
print("Squares:", squares)`,
  },
  {
    id: "java",
    label: "Java",
    pistonLang: "java",
    pistonVersion: "15.0.2",
    extension: java(),
    livePreview: false,
    color: "text-red-400",
    defaultCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Luffy AI! 🚀");

        // Array example
        int[] arr = {5, 3, 8, 1, 9, 2};
        int max = arr[0];
        for (int n : arr) {
            if (n > max) max = n;
        }
        System.out.println("Max value: " + max);

        // For loop
        for (int i = 1; i <= 5; i++) {
            System.out.println(i + " x " + i + " = " + (i * i));
        }
    }
}`,
  },
  {
    id: "cpp",
    label: "C++",
    pistonLang: "cpp",
    pistonVersion: "10.2.0",
    extension: cpp(),
    livePreview: false,
    color: "text-purple-400",
    defaultCode: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    cout << "Hello from Luffy AI! 🚀" << endl;

    vector<int> v = {5, 3, 8, 1, 9, 2};
    sort(v.begin(), v.end());

    cout << "Sorted: ";
    for (int n : v) cout << n << " ";
    cout << endl;

    cout << "Max: " << *max_element(v.begin(), v.end()) << endl;
    return 0;
}`,
  },
];

/* ── Piston API executor ── */
async function runWithPiston(lang: LangDef, code: string): Promise<string> {
  const res = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: lang.pistonLang,
      version: lang.pistonVersion || "*",
      files: [{ content: code }],
    }),
  });
  if (!res.ok) throw new Error(`Piston API error: ${res.status}`);
  const data = await res.json();
  const out = data.run?.output || "";
  const err = data.run?.stderr || "";
  return (out + (err ? `\n\nSTDERR:\n${err}` : "")).trim();
}

export default function PlaygroundPage() {
  const [activeLang, setActiveLang] = useState<LangDef>(LANGS[0]);
  const [code, setCode]             = useState(LANGS[0].defaultCode);
  const [output, setOutput]         = useState("");
  const [running, setRunning]       = useState(false);
  const [previewSrc, setPreviewSrc] = useState(LANGS[0].defaultCode);
  const [splitMode, setSplitMode]   = useState<"split" | "editor" | "preview">("split");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [copied, setCopied]         = useState(false);
  const previewDebounce             = useRef<ReturnType<typeof setTimeout>>();

  /* Live HTML preview — debounced */
  useEffect(() => {
    if (!activeLang.livePreview) return;
    clearTimeout(previewDebounce.current);
    previewDebounce.current = setTimeout(() => setPreviewSrc(code), 400);
  }, [code, activeLang]);

  const switchLang = (lang: LangDef) => {
    setActiveLang(lang);
    setCode(lang.defaultCode);
    setOutput("");
    setShowLangMenu(false);
  };

  const handleRun = async () => {
    if (running) return;
    if (activeLang.livePreview) { setPreviewSrc(code); return; }
    setRunning(true);
    setOutput("⏳ Running...");
    try {
      const result = await runWithPiston(activeLang, code);
      setOutput(result || "(no output)");
    } catch (e: any) {
      setOutput(`❌ Error: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showEditor  = splitMode === "split" || splitMode === "editor";
  const showPreview = splitMode === "split" || splitMode === "preview";

  return (
    <div className="flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden">

      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card/60 backdrop-blur shrink-0">
        <Link href="/">
          <a className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </a>
        </Link>

        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">Code Playground</span>
        </div>

        {/* Language selector */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowLangMenu((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border text-sm hover:border-primary/40 transition-colors"
          >
            <span className={cn("font-medium text-xs", activeLang.color)}>{activeLang.label}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>

          {showLangMenu && (
            <div className="absolute top-full mt-1 left-0 z-50 bg-card border border-border rounded-xl shadow-xl shadow-black/30 py-1 min-w-[130px]">
              {LANGS.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => switchLang(lang)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-accent transition-colors",
                    activeLang.id === lang.id && "bg-accent/70"
                  )}
                >
                  <span className={cn("font-semibold", lang.color)}>{lang.label}</span>
                  {lang.livePreview && (
                    <span className="ml-auto text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">LIVE</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* View toggle */}
        <div className="flex items-center bg-background border border-border rounded-lg overflow-hidden">
          {([
            { id: "editor",  icon: Code2 },
            { id: "split",   icon: Monitor },
            { id: "preview", icon: Monitor },
          ] as const).map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSplitMode(id)}
              title={id}
              className={cn(
                "px-2.5 py-1.5 text-xs transition-colors",
                splitMode === id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {id === "editor"  ? <Code2 className="w-3.5 h-3.5" /> :
               id === "split"   ? <div className="flex gap-0.5 items-center"><div className="w-2.5 h-3.5 border border-current rounded-sm" /><div className="w-2.5 h-3.5 border border-current rounded-sm" /></div> :
               <Monitor className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>

        {/* Copy */}
        <button
          onClick={copyCode}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>

        {/* Run */}
        <button
          onClick={handleRun}
          disabled={running}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.97] disabled:opacity-60 transition-all shadow-sm shadow-primary/30"
        >
          {running
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Play className="w-4 h-4 fill-current" />}
          {activeLang.livePreview ? "Refresh" : "Run"}
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden" onClick={() => setShowLangMenu(false)}>

        {/* Editor panel */}
        {showEditor && (
          <div
            className={cn(
              "flex flex-col min-w-0 border-r border-border overflow-hidden",
              splitMode === "split" ? "w-1/2" : "flex-1"
            )}
          >
            <div className="flex items-center justify-between px-4 py-2 bg-card/40 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="text-[11px] text-muted-foreground ml-1">
                  main.{activeLang.id === "cpp" ? "cpp" : activeLang.id === "java" ? "java" : activeLang.id === "python" ? "py" : activeLang.id === "javascript" ? "js" : "html"}
                </span>
              </div>
              <span className={cn("text-[11px] font-semibold", activeLang.color)}>{activeLang.label}</span>
            </div>

            <div className="flex-1 overflow-auto">
              <CodeMirror
                value={code}
                height="100%"
                theme={oneDark}
                extensions={[activeLang.extension]}
                onChange={(val) => setCode(val)}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  autocompletion: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  indentOnInput: true,
                }}
                style={{ fontSize: "13px", height: "100%" }}
              />
            </div>
          </div>
        )}

        {/* Preview / Output panel */}
        {showPreview && (
          <div
            className={cn(
              "flex flex-col min-w-0 overflow-hidden",
              splitMode === "split" ? "w-1/2" : "flex-1"
            )}
          >
            {activeLang.livePreview ? (
              /* HTML live preview */
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-card/40 border-b border-border shrink-0">
                  <Monitor className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] text-muted-foreground">Live Preview</span>
                  <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <iframe
                  key={previewSrc}
                  srcDoc={previewSrc}
                  className="flex-1 w-full bg-white border-none"
                  sandbox="allow-scripts allow-modals allow-forms allow-popups"
                  title="live-preview"
                />
              </>
            ) : (
              /* Console output */
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-card/40 border-b border-border shrink-0">
                  <Terminal className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] text-muted-foreground">Console Output</span>
                  {output && (
                    <button
                      onClick={() => setOutput("")}
                      className="ml-auto text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-auto p-4 font-mono text-[13px] bg-[#1a1b26]">
                  {!output ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                      <Terminal className="w-10 h-10 opacity-20" />
                      <p className="text-sm">Press <kbd className="px-2 py-0.5 rounded bg-muted border border-border text-xs">Run</kbd> to execute</p>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap leading-relaxed text-green-300 break-words">
                      {output}
                    </pre>
                  )}
                </div>

                {/* Status bar */}
                <div className="flex items-center gap-3 px-4 py-1.5 bg-card/40 border-t border-border text-[10px] text-muted-foreground shrink-0">
                  <span>{activeLang.label} • {activeLang.pistonVersion}</span>
                  <span className="ml-auto">Powered by Piston Engine</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
