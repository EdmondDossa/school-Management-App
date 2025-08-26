import React, { useEffect, useState } from "react";
import { TimerReset } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { AnneeScolaireService } from "../../../../services";
import toast from "react-hot-toast";
import { displayAnneeAnterieureToast } from "../../../utils";

const AnneeScolaireAnterieures = ({ isAnneeUpdate = false }) => {
  const [anneesScolaires, setAnneeScolaires] = useState([]);
  const [savedAnnee, setSavedAnnee] = useState({}); //annee scolaire on the local storage
  const [isDisplayingTooltip, setDisplayTooltip] = useState(false);

  async function fetchAnneeScolairesInfo() {
    const annees = await AnneeScolaireService.getAllOldAnneeScolaire();

    setAnneeScolaires(annees);
  }

  async function fetchLocalAnneeScolaire() {
    const savedAnnee = await window.electronAPI.store.get(
      "anneeScolaireEncours"
    );
    setSavedAnnee(savedAnnee);
    return savedAnnee;
  }

  //check an old annee scolaire <=> change the value of annee scolaire on the storage
  async function enableOldAnneePreview(annee) {
    await window.electronAPI.store.set("anneeScolaireEncours", annee);
    const localAnnee = await fetchLocalAnneeScolaire();
    //remove all existing toast
    toast.dismiss();
    //display a permananent toast to show the current year on the storage
    displayAnneeAnterieureToast(localAnnee.Annee);
  }

  //set the year on the storage as the  value of the last saved year with the status EnCours
  async function resetAnnee() {
    const currentAnnee = await AnneeScolaireService.getLastAnneeScolaire();
    //if there is no year with the status en cours just set en empt value
    await window.electronAPI.store.set(
      "anneeScolaireEncours",
      currentAnnee.Statut === "EnCours" ? currentAnnee : {}
    );
    fetchLocalAnneeScolaire();
    //remove all toast
    toast.dismiss();
  }

  //isAnneeUpdate is a value coming from the parent component that change his state
  //each time an update is made to AnneeScolaire. By example a new value is trigger whenever a year
  //is set as terminee or if a year is created to allow this component to update his local state

  useEffect(() => {
    fetchAnneeScolairesInfo();
    fetchLocalAnneeScolaire();
  }, [isAnneeUpdate]);

  if (anneesScolaires?.length === 0) return <div></div>;

  return (
    <>
      <div className="float-right m-3">
        <button id="btn-old-annee" onClick={() => setDisplayTooltip(true)}>
          <TimerReset className="w-10 h-10 text-slate-500" />

          {!isDisplayingTooltip ? (
            <Tooltip
              anchorSelect="#btn-old-annee"
              content="Consulter les années scolaires antérieures"
            />
          ) : (
            <Tooltip
              anchorSelect="#btn-old-annee"
              openOnClick={true}
              clickable={true}
              afterHide={() => setDisplayTooltip(false)}
              className="w-[400px] p-0 bg-white shadow-md opacity-100 rounded-sm max-h-[350px] overflow-y-auto overflow-x-hidden"
            >
              <div className="relative">
                <h2 className="z-10 sticky top-0 bg-blue-700 text-white text-center py-3 mb-3 w-full font-bold">
                  Liste des années scolaires antérieures
                </h2>
                <ul>
                  {anneesScolaires.map((annee) => {
                    let isConsulting = savedAnnee.id === annee.id;
                    return (
                      <li className="flex justify-between items-center p-3 text-black">
                        <h4> {annee.Annee} </h4>
                        <div>
                          <button
                            className={`rounded-sm p-3 py-2 text-white ${
                              !isConsulting
                                ? "bg-emerald-700 hover:bg-emerald-600"
                                : "bg-slate-500"
                            }`}
                            onClick={() => enableOldAnneePreview(annee)}
                            disabled={isConsulting}
                          >
                            {!isConsulting ? "Consulter" : "En Cours..."}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {anneesScolaires.some((e) => e.id === savedAnnee.id) && (
                <button
                  type="reset"
                  className="bg-red-400  p-2 text-center m-2 rounded-sm float-left sticky bottom-0"
                  onClick={resetAnnee}
                >
                  Annuler
                </button>
              )}
            </Tooltip>
          )}
        </button>
      </div>
    </>
  );
};

export default AnneeScolaireAnterieures;
