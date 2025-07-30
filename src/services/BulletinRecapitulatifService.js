class BulletinRecapitulatifService {
  static async create(NumIns, Periode, Rang, Moyenne) {
    const sql = `
            INSERT INTO bulletins (NumIns, Periode, Rang, Moyenne)
            VALUES (?,?,?,?)
            ON CONFLICT (NumIns,Periode)
            DO UPDATE 
            SET Rang = ? ,Moyenne = ? WHERE NumIns = ? AND Periode = ?
        `;
    const result = await window.electronAPI.db.query(sql, [
      NumIns,
      Periode,
      Rang,
      Moyenne,
      Rang,
      Moyenne,
      NumIns,
      Periode,
    ]);
    return result;
  }

  static async getByNumIns(NumIns) {
    const sql = "SELECT * FROM bulletins WHERE NumIns = ?";
    const result = await window.electronAPI.db.query(sql, [NumIns]);
    return result.data;
  }
}
export default BulletinRecapitulatifService;
