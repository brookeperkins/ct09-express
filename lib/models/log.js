const pool = require('../utils/pool');

module.exports = class Log {
    id;
    recipeId;
    dateOfEvent;
    notes;
    rating;

    constructor(row) {
      this.id = row.id;
      this.recipeId = row.recipe_id;
      this.dateOfEvent = row.date_of_event;
      this.notes = row.notes;
      this.rating = row.rating;
    }

    static async insert(log) {
      const { rows } = await pool.query(
        'INSERT into logs (recipe_id, date_of_event, notes, rating) VALUES ($1, $2, $3, $4) RETURNING *', [log.recipeId, log.dateOfEvent, log.notes, log.rating]
      );

      return new Log(rows[0]);
    }

    static async find() {
      const { rows } = await pool.query(
        'SELECT * FROM logs'
      );
    
      return rows.map(row => new Log(row));
    }

    static async findById(id) {
      const { rows } = await pool.query(
        'SELECT * FROM logs WHERE id=$1',
        [id]
      );
    
      if(!rows[0]) return null;
      else return new Log(rows[0]);
    }

    static async update(id, log) {
      const { rows } = await pool.query(
        `UPDATE logs
           SET recipe_id=$1,
               date_of_event=$2,
               notes=$3,
               rating=$4
           WHERE id=$5
           RETURNING *
          `,
        [log.recipeId, log.dateOfEvent, log.notes, log.rating, id]
      );
    
      return new Log(rows[0]);
    }

    static async delete(id) {
      const { rows } = await pool.query(
        'DELETE FROM logs WHERE id=$1 RETURNING *',
        [id]
      );
    
      return new Log(rows[0]);
    }
};
