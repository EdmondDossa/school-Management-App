class profMatieresService {
  static async setMatiereForProf(NumProf,CodMat){
    let sql = "INSERT INTO profmatieres (NumProf,CodMat) VALUES (?, ?)";
    const result = await window.electronAPI.db.query(sql,[NumProf,CodMat]);
    return result;
  }

  static async defineMatieresForProf(NumProf,matieres){
    //remove all precedent matieres
    await this.deleteRecordByProf(NumProf);
    //set all current matieres
    if(matieres.length > 0){
      const values = matieres.map((matiere) => `(${NumProf},${matiere})`).join(',');
      const sql = `INSERT INTO profmatieres VALUES ${values}`;
      const result = await window.electronAPI.db.query(sql);
      return result;
    }
  }

  static async removeMatiereOnProf(NumProf,CodMat){
    let sql = "DELETE FROM profmatieres WHERE NumProf = ? AND CodMat = ?";
    const result = await window.electronAPI.db.query(sql,[NumProf,CodMat]);
    return result;
  }

  static async deleteRecordByMatiere(CodMat){
    let sql = "DELETE FROM profmatieres WHERE CodMat = ?";
    const result = await window.electronAPI.db.query(sql,[CodMat]);
    return result;
  }

  static async deleteRecordByProf(NumProf){
    let sql = "DELETE FROM profmatieres WHERE NumProf = ?";
    const result = await window.electronAPI.db.query(sql,[NumProf]);
    return result;
  }

  static async getProfMatieres(NumProf){
    let sql = `
            SELECT m.CodMat,m.NomMat FROM matieres m
            JOIN profmatieres pm
            on pm.CodMat = m.CodMat
            WHERE NumProf = ?
  `;
    const { data:rows } = await window.electronAPI.db.query(sql,[NumProf]);
    return rows;
  }
}

export default  profMatieresService;