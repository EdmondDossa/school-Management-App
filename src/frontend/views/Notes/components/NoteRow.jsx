import React, { useEffect, useState } from "react";
import { TableRow, TableCell } from "../../../components/CTable";
import { ComposerService } from "../../../../services";
import toast from "react-hot-toast";

const fieldsNotes = ["I1", "I2", "I3", "D1", "D2", "D3", "MI", "MT"];

const NoteRow = ({ eleve, index, CodMat, NumClass, Periode, oldNotes }) => {
  const [notes, setNotes] = useState({});

  const setFocus = (e) => {
    e.currentTarget.childNodes[0].focus();
  };

  const handleChange = (e) => {
    if (
      /^\d+(.\d+)?$/.test(e.currentTarget.value) ||
      e.currentTarget.value === ""
    ) {
      setNotes({
        ...notes,
        [e.currentTarget["id"].slice(0, 2)]: e.currentTarget.value,
      });
    }
  };

  async function handleNoteEdit({ currentTarget }) {
    const field = currentTarget["id"].slice(0, 2);
    //when the field pass from a value to none
    if (notes[field] === "" || notes[field] === undefined) {
      await ComposerService.deleteComposer(
        eleve.NumIns,
        CodMat,
        Periode,
        field
      );
      calculMoyennes();
      return;
    }

    const note = Number(notes[field]);

    //Invalid note for NaN
    if (!note && note != 0) {
      setNotes({ ...notes, [field]: "" });
      calculMoyennes();
      return;
    }

    if (note < 0 || note > 20) {
      toast.error("Intervalle de la note invalide!");
      setNotes({ ...notes, [field]: "" });
      return;
    }

    try {
      const composer = {
        NumIns: eleve.NumIns,
        Type: field,
        NumClass,
        Note: note,
        Periode,
        CodMat,
      };
      await ComposerService.setComposer(composer);
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue.");
    }
    calculMoyennes();
  }

  function calculMoyennes(currentNotes = notes) {
    const n = { interro: [], devoirs: [] };
    const keys = Object.keys(currentNotes);

    if (keys.length > 0) {
      keys.map((key) => {
        if (key.startsWith("I") && currentNotes[key] != "")
          n.interro.push(+currentNotes[key]);
        else if (key.startsWith("D") && currentNotes[key] != "")
          n.devoirs.push(+currentNotes[key]);
      });

      let MI,
        MT = 0;
      if (n.interro.length > 0) {
        MI = n.interro.reduce((acc, val) => acc + val) / n.interro.length;
      } else {
        MI = 0;
      }

      if (n.devoirs.length > 0) {
        MT =
          (MI + n.devoirs.reduce((acc, val) => acc + val)) /
          (n.interro.length ? 1 + n.devoirs.length : n.devoirs.length);
      } else {
        MT = MI;
      }

      setNotes({ ...currentNotes, MI: MI?.toFixed(2), MT: MT?.toFixed(2) });
    }
  }

  function colorPalettes(field) {
    if (["MI", "MT"].includes(field)) {
      const note = Number(notes[field]) || 0;
      if (note < 10) {
        return "bg-red-400 font-font-regular";
      }
      if (note < 13) {
        return "bg-orange-500 font-font-regular";
      }
      if (note < 16) {
        return "bg-emerald-500  font-font-regular";
      }

      return "bg-emerald-600  font-font-regular";
    } else {
      return "bg-gray-50";
    }
  }

  useEffect(() => {
    setNotes(oldNotes);
    calculMoyennes(oldNotes); //when notes are changed in the parent components
  }, [oldNotes, CodMat, Periode]);

  return (
    <>
      <TableRow>
        <TableCell className="border-r-2 border-gray-100">{index}</TableCell>
        <TableCell className="font-semibold text-gray-800 text-left max-w-[40px] ">
          {(eleve.Nom + " " + eleve.Prenoms).length > 30
            ? (eleve.Nom + " " + eleve.Prenoms).substring(0, 27) + "..."
            : eleve.Nom + " " + eleve.Prenoms}
        </TableCell>
        {fieldsNotes.map((field) => (
          <TableCell
            onClick={setFocus}
            key={field}
            title={
              !CodMat && !["MI", "MT"].includes(field)
                ? "Sélectionner d'abord une matière"
                : ""
            }
            className={`border-2  ${colorPalettes(
              field
            )} transition border border-gray-300 ${
              !CodMat && !["MI", "MT"].includes(field)
                ? "cursor-not-allowed"
                : ""
            }`}
          >
            <input
              type="number"
              max={20}
              min={0}
              value={notes[field] ?? ""}
              onChange={handleChange}
              onBlur={handleNoteEdit}
              id={`${field}-${eleve.NumIns}`}
              disabled={["MI", "MT"].includes(field) || !CodMat}
              className={`group-hover:bg-gray-100 bg-inherit transition border-none outline-none focus:border-none focus:outline-none h-full w-full block `}
            />
          </TableCell>
        ))}
      </TableRow>
    </>
  );
};

export default React.memo(NoteRow);
