const db = require('../config/db');

const Dashboard = {
  // ESTADÍSTICAS PRINCIPALES
  getMainStats: async (mes, año) => {
    try {
      
      const [totalEstudiantes] = await db.query(
        'SELECT COUNT(*) as total FROM alumnos WHERE activo = 1'
      );

      
      const [ingresosMes] = await db.query(
        `SELECT SUM(monto) as total FROM pagos 
         WHERE MONTH(fecha_pago) = ? AND YEAR(fecha_pago) = ? 
         AND estado = 'pagado'`,
        [mes, año]
      );

      
      const [eventosMes] = await db.query(
        `SELECT COUNT(*) as total FROM eventos 
         WHERE MONTH(fecha) = ? AND YEAR(fecha) = ?`,
        [mes, año]
      );

      const [alertas] = await db.query(
        `SELECT COUNT(*) as total FROM alertas WHERE resuelta = 0`
      );

      return {
        totalEstudiantes: totalEstudiantes[0].total,
        ingresosMes: ingresosMes[0].total || 0,
        eventosMes: eventosMes[0].total,
        alertasActivas: alertas[0].total
      };
    } catch (error) {
      throw error;
    }
  },

  //  DISTRIBUCIÓN POR ARTE MARCIAL
  getMartialArtsDistribution: async () => {
    try {
      const [distribucion] = await db.query(`
        SELECT 
          a.nombre as arte_marcial,
          COUNT(*) as cantidad,
          ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM alumnos WHERE activo = 1)), 1) as porcentaje
        FROM alumnos al
        JOIN artes_marciales a ON al.arte_marcial_id = a.id
        WHERE al.activo = 1
        GROUP BY a.nombre
        ORDER BY cantidad DESC
      `);
      return distribucion;
    } catch (error) {
      throw error;
    }
  },

  // ESTADO DE PAGOS DEL MES
  getPaymentsStatus: async (mes, año) => {
    try {
      // Total pagos del mes
      const [pagos] = await db.query(`
        SELECT 
          estado,
          COUNT(*) as cantidad,
          SUM(monto) as total
        FROM pagos
        WHERE MONTH(fecha_vencimiento) = ? AND YEAR(fecha_vencimiento) = ?
        GROUP BY estado
      `, [mes, año]);

     
      const [vencidos] = await db.query(`
        SELECT COUNT(*) as cantidad, SUM(monto) as total
        FROM pagos
        WHERE estado = 'pendiente' 
        AND fecha_vencimiento < CURDATE()
      `);

      return {
        porEstado: pagos,
        vencidos: vencidos[0]
      };
    } catch (error) {
      throw error;
    }
  },

  // EVENTOS PRÓXIMOS
  getUpcomingEvents: async (limite = 5) => {
    try {
      const [eventos] = await db.query(`
        SELECT 
          id,
          titulo,
          descripcion,
          fecha,
          TIME(fecha) as hora,
          tipo,
          DATEDIFF(fecha, CURDATE()) as dias_restantes
        FROM eventos
        WHERE fecha >= CURDATE()
        ORDER BY fecha ASC
        LIMIT ?
      `, [limite]);
      return eventos;
    } catch (error) {
      throw error;
    }
  },

  // ALERTAS ACTIVAS
  getActiveAlerts: async () => {
    try {
      
      const [pagosPendientes] = await db.query(`
        SELECT 
          p.id,
          CONCAT(a.nombre, ' ', a.apellido) as alumno,
          p.monto,
          DATEDIFF(CURDATE(), p.fecha_vencimiento) as dias_vencido,
          'pago' as tipo
        FROM pagos p
        JOIN alumnos a ON p.alumno_id = a.id
        WHERE p.estado = 'pendiente'
          AND p.fecha_vencimiento <= CURDATE()
        ORDER BY p.fecha_vencimiento ASC
        LIMIT 5
      `);

      
      const [eventosProximos] = await db.query(`
        SELECT 
          id,
          titulo,
          fecha,
          DATEDIFF(fecha, CURDATE()) as dias_restantes,
          'evento' as tipo
        FROM eventos
        WHERE fecha >= CURDATE()
          AND fecha <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        ORDER BY fecha ASC
        LIMIT 5
      `);

      return {
        pagosPendientes,
        eventosProximos
      };
    } catch (error) {
      throw error;
    }
  },

  //  ESTUDIANTES RECIENTES
  getRecentStudents: async (limite = 5) => {
    try {
      const [estudiantes] = await db.query(`
        SELECT 
          a.id,
          CONCAT(a.nombre, ' ', a.apellido) as nombre_completo,
          am.nombre as arte_marcial,
          a.grado_actual,
          a.fecha_inscripcion,
          p.estado as estado_pago,
          p.fecha_pago as ultimo_pago
        FROM alumnos a
        JOIN artes_marciales am ON a.arte_marcial_id = am.id
        LEFT JOIN (
          SELECT alumno_id, estado, fecha_pago,
                 ROW_NUMBER() OVER (PARTITION BY alumno_id ORDER BY fecha_pago DESC) as rn
          FROM pagos
        ) p ON a.id = p.alumno_id AND p.rn = 1
        WHERE a.activo = 1
        ORDER BY a.fecha_inscripcion DESC
        LIMIT ?
      `, [limite]);
      return estudiantes;
    } catch (error) {
      throw error;
    }
  },

  //  DASHBOARD DEL ESTUDIANTE
  getStudentDashboard: async (alumnoId) => {
    try {
      
      const [perfil] = await db.query(`
        SELECT 
          a.*,
          am.nombre as arte_marcial,
          CONCAT(a.nombre, ' ', a.apellido) as nombre_completo
        FROM alumnos a
        JOIN artes_marciales am ON a.arte_marcial_id = am.id
        WHERE a.id = ?
      `, [alumnoId]);

      
      const [pagos] = await db.query(`
        SELECT 
          MONTH(fecha_vencimiento) as mes,
          monto,
          estado,
          fecha_vencimiento
        FROM pagos
        WHERE alumno_id = ?
          AND YEAR(fecha_vencimiento) = YEAR(CURDATE())
        ORDER BY fecha_vencimiento ASC
      `, [alumnoId]);

      
      const [eventos] = await db.query(`
        SELECT 
          e.*,
          ae.asistio
        FROM eventos e
        JOIN alumno_evento ae ON e.id = ae.evento_id
        WHERE ae.alumno_id = ?
          AND e.fecha >= CURDATE()
        ORDER BY e.fecha ASC
        LIMIT 5
      `, [alumnoId]);

      
      const [progresion] = await db.query(`
        SELECT 
          grado,
          fecha_obtencion,
          instructor
        FROM progresion_grados
        WHERE alumno_id = ?
        ORDER BY fecha_obtencion ASC
      `, [alumnoId]);

      return {
        perfil: perfil[0],
        pagos,
        eventos,
        progresion
      };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Dashboard;