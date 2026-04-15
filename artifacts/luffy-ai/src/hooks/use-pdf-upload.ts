import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function usePdfUpload(onText: (text: string) => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);
  const { toast } = useToast();

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!inputRef.current) return;
    inputRef.current.value = "";

    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({ title: "Please upload a PDF file", variant: "destructive" });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "PDF too large (max 20 MB)", variant: "destructive" });
      return;
    }

    setIsParsing(true);
    toast({ title: `Reading "${file.name}"…` });

    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs",
        import.meta.url
      ).toString();

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const maxPages = Math.min(pdf.numPages, 30);
      const parts: string[] = [];

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => ("str" in item ? item.str : ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        if (pageText) parts.push(pageText);
      }

      const extracted = parts.join("\n\n");
      if (!extracted.trim()) {
        toast({ title: "No readable text found in this PDF", variant: "destructive" });
        return;
      }

      const truncated =
        extracted.length > 6000 ? extracted.slice(0, 6000) + "\n\n[… text truncated for length]" : extracted;

      onText(
        `I've uploaded a PDF: "${file.name}"\n\nHere is the extracted content:\n\n${truncated}\n\nPlease summarize or generate MCQ quiz questions from this content.`
      );

      toast({ title: `PDF loaded — ${pdf.numPages} page(s)` });
    } catch (err) {
      console.error("PDF parse error", err);
      toast({ title: "Failed to read PDF", variant: "destructive" });
    } finally {
      setIsParsing(false);
    }
  };

  return { inputRef, openPicker, handleFile, isParsing };
}
