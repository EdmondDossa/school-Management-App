import toast from "react-hot-toast";

const handleUploadFile = async (file, targetFolder) => {
  if (!file) {
    toast.error("Le fichier est requis.");
    return {
      success: false,
      error: "Le fichier est requis.",
    };
  }

  if (!targetFolder) {
    toast.error("Le dossier cible est requis.");
    return {
      success: false,
      error: "Le dossier cible est requis.",
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();

    const fileName = await window.electronAPI.generateFilename(file.name);

    const result = await window.electronAPI.saveFile({
      fileName: fileName,
      fileData: new Uint8Array(arrayBuffer),
      targetSubfolder: targetFolder,
    });

    if (result.success) {
      toast.success(`Fichier sauvegardé dans ${result.folder}/${fileName}`);
      return {
        success: true,
        path: result.path,
        folder: result.folder,
        fileName: fileName,
      };
    } else {
      toast.error(`Erreur lors de la sauvegarde du fichier : ${result.error}`);
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    toast.error(`Erreur lors de la sauvegarde du fichier : ${error.message}`);
    console.error("Erreur lors de la sauvegarde du fichier :", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const getResourcesPath = async () => {
  const path = await window.electronAPI.getAppPath();
  return path;
};

async function detectPeriodeActuelle() {
  const anneeScolaire = await window.electronAPI.store.get(
    "anneeScolaireEncours"
  );
  const { DateDebut, DateFin, Periodicite } = anneeScolaire;

  const semestres = ["1er Semestre", "2ème Semestre"];
  const trimestres = ["1er Trimestre", "2ème Trimestre", "3ème Trimestre"];

  const start = new Date(DateDebut);
  const end = new Date(DateFin);
  const now = new Date();

  // Vérifier si on est dans la période scolaire
  if (now < start || now > end) {
    return "Hors période scolaire";
  }

  // Calculer la progression dans l'année scolaire
  const totalDuration = end - start;
  const elapsed = now - start;
  const progress = elapsed / totalDuration;

  let numPeriode = 0;

  if (Periodicite === "Semestre") {
    // Pour les semestres : 0-0.5 = 1er semestre, 0.5-1 = 2ème semestre
    numPeriode = progress < 0.5 ? 1 : 2;
    return semestres[numPeriode - 1];
  }

  if (Periodicite === "Trimestre") {
    // Pour les trimestres : 0-1/3 = 1er, 1/3-2/3 = 2ème, 2/3-1 = 3ème
    if (progress < 1 / 3) {
      numPeriode = 1;
    } else if (progress < 2 / 3) {
      numPeriode = 2;
    } else {
      numPeriode = 3;
    }
    return trimestres[numPeriode - 1];
  }

  // Si la périodicité n'est ni "Semestre" ni "Trimestre"
  return "Périodicité non reconnue";
}

export { handleUploadFile, getResourcesPath, detectPeriodeActuelle };
