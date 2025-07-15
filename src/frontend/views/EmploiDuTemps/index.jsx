import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  BookOpen,
  FileText,
  Loader,
} from "lucide-react"; // Import FileText for the export icon
import AnneeScolaireService from "../../../services/AnneeScolaireService";
import ClasseService from "../../../services/ClasseService";
import CoursService from "../../../services/CoursService";
import MatiereService from "../../../services/MatiereService";
import jsPDF from "jspdf"; // Import jsPDF
import html2canvas from "html2canvas"; // Import html2canvas

// These are constants, so they can be defined outside the component
// to prevent re-creation on every render.
const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const hours = Array.from({ length: (19 - 7) * 2 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const minutes = (i % 2) * 30;
  return `${hour.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
});

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const EmploiDuTemps = () => {
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState("");
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [scheduleGrid, setScheduleGrid] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  const [newSlot, setNewSlot] = useState({
    day: "",
    time: "",
    duration: 1,
    subject: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const result = await AnneeScolaireService.getAllAnneesScolaires();
      if (result.success) {
        const years = result.data;
        setSchoolYears(years);
        if (years.length > 0) {
          setSelectedSchoolYear(years[0].Annee);
        }
        const fetchedMatieres = await MatiereService.getAllMatieres();
        setMatieres(fetchedMatieres);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSchoolYear) {
      const fetchClasses = async () => {
        const fetchedClasses = await ClasseService.getClassesByAnneeScolaire(
          selectedSchoolYear
        );
        setClasses(fetchedClasses);
        if (fetchedClasses.length > 0) {
          setSelectedClass(fetchedClasses[0].NumClass);
        } else {
          setSelectedClass("");
          setSchedules([]);
        }
      };
      fetchClasses();
    }
  }, [selectedSchoolYear]);

  const fetchCoursForClass = useCallback(async () => {
    if (selectedClass && selectedSchoolYear) {
      const fetchedCours = await CoursService.getCoursByClasseAndAnnee(
        selectedClass,
        selectedSchoolYear
      );
      setSchedules(fetchedCours);
    } else {
      setSchedules([]);
    }
  }, [selectedClass, selectedSchoolYear]);

  useEffect(() => {
    fetchCoursForClass();
  }, [fetchCoursForClass]);

  useEffect(() => {
    const newGrid = Array(hours.length)
      .fill(null)
      .map(() => Array(days.length).fill(null));
    if (schedules.length > 0) {
      schedules.forEach((slot) => {
        const dayIndex = days.indexOf(slot.Jour);
        const startTimeMinutes = timeToMinutes(slot.HDebut);
        let timeIndex = hours.findIndex(
          (h) => timeToMinutes(h) === startTimeMinutes
        );

        if (dayIndex !== -1 && timeIndex !== -1) {
          newGrid[timeIndex][dayIndex] = { slot: slot, isStart: true };
          const numCoveredCells = slot.NBHeures * 2;
          for (let i = 1; i < numCoveredCells; i++) {
            if (timeIndex + i < hours.length) {
              newGrid[timeIndex + i][dayIndex] = { slot: slot, isStart: false };
            }
          }
        }
      });
    }
    setScheduleGrid(newGrid);
  }, [schedules]);

  const resetModal = () => {
    setShowAddModal(false);
    setEditingSlot(null);
    setNewSlot({ day: "", time: "", duration: 1, subject: "" });
  };

  const handleSaveSlot = async () => {
    if (!selectedClass || !newSlot.day || !newSlot.time || !newSlot.subject) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const cours = {
      Num_Cours: editingSlot ? editingSlot.NumCours : undefined,
      HDebut: newSlot.time,
      NBHeures: newSlot.duration,
      Jour: newSlot.day,
      Cod_Mat: newSlot.subject,
      Num_Class: selectedClass,
      Annee: selectedSchoolYear,
    };

    const serviceAction = editingSlot
      ? CoursService.updateCours
      : CoursService.createCours;
    const result = await serviceAction(cours);

    if (result.success) {
      fetchCoursForClass();
      resetModal();
    } else {
      alert("Erreur lors de la sauvegarde du cours.");
    }
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setNewSlot({
      day: slot.Jour,
      time: slot.HDebut,
      duration: slot.NBHeures,
      subject: slot.CodMat,
    });
    setShowAddModal(true);
  };

  const handleDeleteSlot = async (slotId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce créneau ?")) {
      await CoursService.deleteCours(slotId);
      fetchCoursForClass();
    }
  };

  const handleCellClick = (day, time) => {
    setNewSlot({ ...newSlot, day, time });
    setShowAddModal(true);
  };

  const getSubjectColor = (subjectId) => {
    const matiere = matieres.find((m) => m.CodMat === subjectId);
    return matiere ? matiere.Couleur : "#A9A9A9";
  };

  const selectedClassInfo = classes.find(
    (c) => c.NumClass === parseInt(selectedClass)
  );

  // New function to handle PDF export
  const handleExportPdf = async () => {
    setIsExporting(true);
    const input = document.getElementById("schedule-table-container");
    if (!input) {
      console.error("Element with ID 'schedule-table-container' not found.");
      return;
    }

    const actionButtons = input.querySelectorAll(".group-hover\\:opacity-100");
    actionButtons.forEach((btn) => (btn.style.visibility = "hidden"));

    try {
      const scheduleCanvas = await html2canvas(input, {
        scale: 2,
        logging: false,
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
      });
      const pdf = new jsPDF("landscape", "mm", "a3");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgData = scheduleCanvas.toDataURL("image/png");
      const imgWidth = scheduleCanvas.width;
      const imgHeight = scheduleCanvas.height;

      const ratio = pdfWidth / imgWidth;
      const imgHeightScaled = imgHeight * ratio;

      if (imgHeightScaled <= pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeightScaled);
      } else {
        let heightLeft = imgHeightScaled;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeightScaled);
        heightLeft -= pdfHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeightScaled;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeightScaled);
          heightLeft -= pdfHeight;
        }
      }

      pdf.save(
        `Emploi_du_temps_${selectedClassInfo?.NomClass}_${selectedSchoolYear}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF.");
    } finally {
      actionButtons.forEach((btn) => (btn.style.visibility = "visible"));
    }
    setIsExporting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="sticky -top-5 z-40 bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Emplois du Temps
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 xl:w-2/3">
              <select
                id="schoolYear"
                value={selectedSchoolYear}
                onChange={(e) => setSelectedSchoolYear(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {schoolYears.map((year) => (
                  <option key={year.Annee} value={year.Annee}>
                    Année: {year.Annee}
                  </option>
                ))}
              </select>
              <select
                id="classSelect"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {classes.map((cls) => (
                  <option key={cls.NumClass} value={cls.NumClass}>
                    Classe: {cls.NomClass}
                  </option>
                ))}
              </select>
              {/* Export PDF Button */}
              <button
                disabled={isExporting}
                onClick={handleExportPdf}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md w-fit hover:bg-green-700 transition-colors duration-200"
              >
                {!isExporting && <FileText className="w-4 h-4" />}
                {isExporting && <Loader className="w-4 h-4" />}

                <p style={{ inlineSize: "max-content" }}>Exporter PDF</p>
              </button>
            </div>
          </div>
        </div>

        <div
          id="legend-section"
          className="bg-white rounded-lg shadow-sm p-4 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-gray-500" />
            <span>Légende des matières pour {selectedClassInfo?.NomClass}</span>
          </h3>
          {schedules && schedules.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from(new Set(schedules.map((slot) => slot.CodMat))).map(
                (subjectId) => (
                  <div key={subjectId} className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: getSubjectColor(subjectId) }}
                    ></div>
                    <div className="text-sm font-medium text-gray-700">
                      {matieres.find((m) => m.CodMat === subjectId)?.NomMat}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Aucun cours programmé pour cette classe.
            </p>
          )}
        </div>

        <div
          id="schedule-table-container"
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          <div className="p-4 border-b bg-gray-50 sticky -top-5 z-20">
            <h3 className="text-lg font-semibold text-gray-900">
              Emploi du temps - {selectedClassInfo?.NomClass}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[768px] table-fixed">
              <thead className=" bg-gray-100">
                <tr className="bg-gray-50  z-10">
                  <th className="w-24 p-3 text-left text-sm font-medium text-gray-700 border-r">
                    Heure
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="p-3 text-center text-sm font-medium text-gray-700 border-r"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((time, timeIndex) => (
                  <tr key={time} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm font-medium text-gray-600 border-r bg-gray-50 h-[56px] align-top">
                      {time}
                    </td>
                    {scheduleGrid[timeIndex] &&
                      scheduleGrid[timeIndex].map((cellInfo, dayIndex) => {
                        if (cellInfo?.isStart) {
                          const { slot } = cellInfo;
                          return (
                            <td
                              key={`${days[dayIndex]}-${time}`}
                              className="p-1 border-r relative align-top items-center"
                              style={{
                                backgroundColor: getSubjectColor(slot.CodMat),
                              }}
                              rowSpan={slot.NBHeures * 2}
                            >
                              <div
                                className="relative rounded-lg p-2 text-white text-xs cursor-pointer group h-full"
                                onClick={() => handleEditSlot(slot)}
                              >
                                <div className="font-semibold mb-1 text-sm">
                                  {slot.NomMat}
                                </div>
                                <div className="opacity-90 mb-1">
                                  {slot.NomProf} {slot.PrenomsProf}
                                </div>
                                <div className="opacity-75 text-xs">
                                  {slot.HDebut} - {slot.Salle}
                                </div>
                                <div className="opacity-75 text-xs">
                                  {slot.NBHeures} H
                                </div>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditSlot(slot);
                                    }}
                                    className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30"
                                    title="Modifier"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSlot(slot.NumCours);
                                    }}
                                    className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </td>
                          );
                        }
                        if (cellInfo && !cellInfo.isStart) return null;
                        return (
                          <td
                            key={`${days[dayIndex]}-${time}`}
                            className="p-1 border-r relative align-top"
                          >
                            <div
                              className="h-[56px] rounded hover:bg-gray-100 cursor-pointer transition-colors flex items-center justify-center group"
                              onClick={() =>
                                handleCellClick(days[dayIndex], time)
                              }
                            >
                              <Plus className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                            </div>
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingSlot ? "Modifier le cours" : "Ajouter un cours"}
                </h3>
                <button
                  onClick={resetModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                <select
                  id="modalDay"
                  value={newSlot.day}
                  onChange={(e) =>
                    setNewSlot((prev) => ({ ...prev, day: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sélectionnez un jour</option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <select
                  id="modalTime"
                  value={newSlot.time}
                  onChange={(e) =>
                    setNewSlot((prev) => ({ ...prev, time: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sélectionnez une heure</option>
                  {hours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
                <select
                  id="modalDuration"
                  value={newSlot.duration}
                  onChange={(e) =>
                    setNewSlot((prev) => ({
                      ...prev,
                      duration: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].map((d) => (
                    <option key={d} value={d}>
                      {d} heure(s)
                    </option>
                  ))}
                </select>
                <select
                  id="modalSubject"
                  value={newSlot.subject}
                  onChange={(e) =>
                    setNewSlot((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sélectionnez une matière</option>
                  {matieres.map((m) => (
                    <option key={m.CodMat} value={m.CodMat}>
                      {m.NomMat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={resetModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveSlot}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingSlot ? "Modifier" : "Ajouter"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmploiDuTemps;
