class ClasseController {
    static tableName = 'classes';

    static async getAll() {
        const data = await window.electronAPI.db.query(`SELECT * FROM ${ClasseController.tableName}`, []).then((rows) => {
            return (rows);
        }).catch(err => console.error('Erreur:', err));

        return data;
    }

    static async getById(id) {
        const data = await window.electronAPI.db.query(`SELECT * FROM ${ClasseController.tableName} WHERE id = ?`, [id]).then((rows) => {
            return (rows);
        }).catch(err => console.error('Erreur:', err));

        return data;

    }

    static async create(classData) {
        const sql = `
            INSERT INTO ${ClasseController.tableName} 
            (name, promotion, capacity, teacherId)
            VALUES (?, ?, ?, ?)
        `;
        const data = await window.electronAPI.db.query(sql, [
            classData.name,
            classData.promotion,
            classData.capacity,
            classData.teacherId
        ]);

        return data;
    }

    static async update(id, classData) {
        const sql = `
            UPDATE ${ClasseController.tableName}
            SET name = ?, promotion = ?, capacity = ?, teacherId = ?
            WHERE id = ?
        `;
        const data = await window.electronAPI.db.query(sql, [
            classData.name,
            classData.promotion,
            classData.capacity,
            classData.teacherId,
            id
        ]);

        return data;
    }

    static async delete(id) {
        const data = await window.electronAPI.db.query(`DELETE FROM ${ClasseController.tableName} WHERE id = ?`, [id]).then((rows) => {
            return (rows);
        }).catch(err => console.error('Erreur:', err));

        return data;
    }
}

// ✅ EXPORT AVEC ES MODULES
export default ClasseController;