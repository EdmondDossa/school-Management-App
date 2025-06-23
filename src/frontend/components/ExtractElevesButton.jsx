import React, { useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import workerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import { Button } from "./Bouton"; // Ajustez le chemin selon votre structure
import Eleve from "../../models/Eleve";
import { ImportIcon, Loader } from "lucide-react";

GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * @typedef {Eleve} Eleve
 * @property {string} Matricule
 * @property {string} Nom
 * @property {string} Prenoms
 * @property {string} Sexe
 * @property {string} DateNaissance
 * @property {string} LieuNaissance
 */

export function ExtractElevesButton({
  buttonText = "Extraire les étudiants",
  onExtract,
  onError,
  variant = "secondary",
  size = "default",
  className,
  ...props
}) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    setLoading(true);
    try {
      const file = e.target.files?.[0];
      if (!file) {
        setLoading(false);
        return;
      }
      const buffer = await file.arrayBuffer();
      const pdf = await getDocument({
        data: buffer,
        disableWorker: true,
      }).promise;

      // 1) reconstituer les lignes
      const rawRows = [];
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const { items } = await page.getTextContent();
        const rowsMap = {};
        items.forEach(({ transform, str }) => {
          const y = Math.round(transform[5]);
          rowsMap[y] = rowsMap[y] || [];
          rowsMap[y].push({ x: transform[4], str });
        });
        Object.keys(rowsMap)
          .map(Number)
          .sort((a, b) => b - a)
          .forEach((y) => {
            const line = rowsMap[y]
              .sort((a, b) => a.x - b.x)
              .map((o) => o.str)
              .join(" ")
              .trim();
            if (line) rawRows.push(line);
          });
      }

      // 2) ignorer tout avant la 1ʳᵉ entête et les éventuelles entêtes suivantes
      const headerRx = /^N°\s+Matricule\s+Nom\s+Prénom/i;
      let seenHeader = false;
      const postHeader = rawRows.filter((ln) => {
        if (!seenHeader) {
          if (headerRx.test(ln)) seenHeader = true;
          return false;
        }
        if (headerRx.test(ln)) return false;
        return true;
      });
      if (!seenHeader)
        throw new Error(
          "Veuillez bien choisir un pdf qui est conforme à celui exporter depuis EDUCMASTER"
        );

      // 3) parser les vraies lignes élèves
      const rowRx =
        /^(\d+)\s+(\d+)\s+([A-ZÉÈÀÙÂÊÎÔÛÄËÏÖÜÇ'\- ]+?)\s+(.+?)\s+(M|F)\s+(\d{2}\/\d{2}\/\d{4})\s+([A-ZÉÈÀÙÂÊÎÔÛÄËÏÖÜÇ]+)/;
      /** @type {Eleve[]} */
      const Eleves = postHeader
        .filter((ln) => /^\d+\s+\d+/.test(ln))
        .map((ln) => ln.match(rowRx))
        .filter(Boolean)
        .map((m) => ({
          Matricule: m[2],
          Nom: m[3].trim(),
          Prenoms: m[4].trim(),
          Sexe: m[5],
          DateNaissance: m[6],
          LieuNaissance: m[7],
        }));

      onExtract(Eleves);
    } catch (err) {
      console.error(err);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={loading}
        variant={variant}
        size={size}
        className={
          className ??
          "bg-[#078A00] text-white rounded-md text-md font-semibold hover:bg-[#078A00]/90"
        }
        {...props}
      >
        {!loading && <ImportIcon />}
        {loading && <Loader />}
        {buttonText ?? "Extraire les étudiants"}
      </Button>
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </>
  );
}
