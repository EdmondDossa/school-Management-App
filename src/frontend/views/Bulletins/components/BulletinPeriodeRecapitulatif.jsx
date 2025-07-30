import React, { useEffect, useState } from "react";
import BulletinRecapitulatifService from "../../../../services/BulletinRecapitulatifService";
import { rangToOrdinal } from "../helpers";

const BulletinPeriodeRecapitulatif = ({ NumIns, periodeEnCours, Sexe }) => {
  const [bulletinsInfo, setBulletinsInfo] = useState([]);
  const [periodeName, setPeriodeName] = useState("");
  const [moyenneAnnuelle, setMoyenneAnnuelle] = useState("");

  async function fetchPastMoyennes() {
    const res = await BulletinRecapitulatifService.getByNumIns(NumIns);
    setBulletinsInfo(res);

    //retrouver si c'est un semestre ou un trimestre
    const [numero, periodeName] = periodeEnCours.split(" ");
    setPeriodeName(periodeName);

    //calculer sa moyenne générale
    if (res.length > 0) {
      const moyenne = (
        res.map((item) => +item.Moyenne).reduce((acc, val) => acc + val) /
        res.length
      ).toFixed(2);
      setMoyenneAnnuelle(moyenne);
    }
  }

  useEffect(() => {
    if (NumIns) fetchPastMoyennes();
  }, [NumIns]);

  //on affiche le bilan uniquement s'il ne s'agit pas du 1er semestre ou trimestre
  if (["1er Trimestre", "1er Semestre"].includes(periodeEnCours)) return <></>;
  return (
    <article>
      <h2 className="text-center font-extrabold my-2 underline">
        {periodeEnCours === "3ème Trimestre" ||
        periodeEnCours === "2ème Semestre"
          ? "Bilan annuel"
          : "Bilan"}
      </h2>
      <section className="flex gap-x-2">
        <div className="w-36 mt-1 h-16 space-y-1">
          <span className="block w-full h-1/2 border border-black bg-gray-800 text-white font-semibold text-center text-sm underline">
            {periodeName}{" "}
          </span>
          <span className="block w-full h-1/2 border border-black bg-gray-800 text-white font-semibold text-center text-sm underline">
            {" "}
            Moyenne{" "}
          </span>
        </div>

        {Array.from(bulletinsInfo)
          .sort()
          .map((item) => {
            //au cas où le 3e trimestre serait déjà dispo on ne l'affiche pas dans le bilan pour le 2e trimsestre
            if (
              item.Periode === "3ème Trimestre" &&
              periodeEnCours === "2ème Trimestre"
            )
              return;
            return (
              <div key={item.created_at} className="w-36 mt-1 h-16 space-y-1">
                <span className="block w-full h-1/2 border border-black text-center underline">
                  {item.Periode}
                </span>
                <div className="w-full flex h-1/2 border border-black">
                  <span className="block w-1/2 text-center font-bold border-r border-black ">
                    {" "}
                    {Number(item.Moyenne).toFixed(2)}{" "}
                  </span>
                  <span className="block w-1/2 text-center font-bold">
                    {" "}
                    {rangToOrdinal(item.Rang, Sexe)}{" "}
                  </span>
                </div>
              </div>
            );
          })}

        {/* quand on est au dernier semestre/trimestre on affiche le statut passant ou non */}
        {["3ème Trimestre", "2ème Semestre"].includes(periodeEnCours) && (
          <>
            <div className="w-56 mt-1 h-16 space-y-1">
              <span className="block w-full h-1/2 border border-black bg-gray-800 text-white font-semibold text-center underline text-sm">
                Moyenne Générale Annuelle
              </span>
              <span className="block w-full h-1/2 border text-center font-extrabold text-gray-600 border-black">
                {moyenneAnnuelle}
              </span>
            </div>
            <div className="w-56 mt-1 h-16 space-y-1">
              <span className="block w-full h-1/2 border border-black bg-gray-800 text-white font-semibold text-sm text-center underline">
                Décision du conseil
              </span>
              <span className="block w-full h-1/2 font-extrabold font-sans whitespace-nowrap text-sm">
                {getAnneeStatut(moyenneAnnuelle)}
              </span>
            </div>
          </>
        )}
      </section>
    </article>
  );
};

function getAnneeStatut(moyenneAnnuelle) {
  return +moyenneAnnuelle < 10
    ? "Reprends la classe"
    : "Passe en classe supérieure";
}

export default BulletinPeriodeRecapitulatif;
