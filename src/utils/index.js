import toast from 'react-hot-toast';
import { PeriodeService } from '../services';

const handleUploadFile = async (file, targetFolder) => {
    if (!file) {
        toast.error("Le fichier est requis.");
        return {
            success: false,
            error: "Le fichier est requis."
        };
    }

    if (!targetFolder) {
        toast.error("Le dossier cible est requis.");
        return {
            success: false,
            error: "Le dossier cible est requis."
        };
    }

    try {
        const arrayBuffer = await file.arrayBuffer();

        const fileName = await window.electronAPI.generateFilename(file.name);

        const result = await window.electronAPI.saveFile({
            fileName: fileName,
            fileData: new Uint8Array(arrayBuffer),
            targetSubfolder: targetFolder
        });

        if (result.success) {
            toast.success(`Fichier sauvegardé dans ${result.folder}/${fileName}`);
            return {
                success: true,
                path: result.path,
                folder: result.folder,
                fileName: fileName
            }
        } else {
            toast.error(`Erreur lors de la sauvegarde du fichier : ${result.error}`);
            return {
                success: false,
                error: result.error
            };
        }
    } catch (error) {
        toast.error(`Erreur lors de la sauvegarde du fichier : ${error.message}`);
        console.error("Erreur lors de la sauvegarde du fichier :", error);
        return {
            success: false,
            error: error.message
        };
    }
};

const getResourcesPath = async () => {
    const path = await window.electronAPI.getAppPath();
    console.log("Chemin vers le dossier des ressources :", path);
    return path;
}

async function detectPeriodeActuelle() {
    const anneeScolaire = await window.electronAPI.store.get('anneeScolaireEncours');
    const { DateDebut, DateFin, Periodicite } = anneeScolaire;
    var numPeriode = 0;
    const start = new Date(DateDebut);
    const end = new Date(DateFin);
    const now = new Date();

    const totalDuration = end - start;

    if (now < start || now > end) {
        return "Hors période scolaire";
    }

    const elapsed = now - start;
    const progress = elapsed / totalDuration;

    if (Periodicite === "Semestre") {
        numPeriode = progress < 0.5 ? 4 : 5;
    }

    if (Periodicite === "Trimestre") {
        if (progress < 1 / 3) numPeriode = 1;
        if (progress < 2 / 3) numPeriode = 2;
        numPeriode = 3;
    }

    const periode = PeriodeService.getPeriodeByNum(numPeriode).then(periode => {
        return periode;
    });

    return periode;
}



export { handleUploadFile, getResourcesPath, detectPeriodeActuelle };
