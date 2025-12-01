import Student from '../models/Student.js';
import Payment from '../models/Payment.js';
import Event from '../models/Event.js';

// 🔢 ESTADÍSTICAS PRINCIPALES DEL ADMIN
export const getAdminStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Total estudiantes activos
    const totalEstudiantes = await Student.countDocuments({ active: true });
    
    // Ingresos este mes
    const ingresosResult = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          paymentDate: { $gte: startOfMonth, $lte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Eventos este mes
    const eventosMes = await Event.countDocuments({
      date: { $gte: startOfMonth, $lte: today }
    });
    
    // Alertas (pagos pendientes vencidos)
    const alertasActivas = await Payment.countDocuments({
      status: 'pending',
      dueDate: { $lt: today }
    });

    res.json({
      success: true,
      data: {
        totalEstudiantes,
        ingresosMes: ingresosResult[0]?.total || 0,
        eventosMes,
        alertasActivas
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
};

// 🥋 DISTRIBUCIÓN POR ARTE MARCIAL
export const getMartialArtsDistribution = async (req, res) => {
  try {
    const distribution = await Student.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: '$martialArt',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          arte_marcial: '$_id',
          cantidad: '$count',
          porcentaje: {
            $multiply: [
              { $divide: ['$count', await Student.countDocuments({ active: true })] },
              100
            ]
          }
        }
      },
      { $sort: { cantidad: -1 } }
    ]);

    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Error al obtener distribución:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener distribución'
    });
  }
};

// 💰 ESTADO DE PAGOS DEL MES
export const getPaymentsStatus = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const payments = await Payment.aggregate([
      {
        $match: {
          dueDate: { $gte: startOfMonth, $lte: today }
        }
      },
      {
        $group: {
          _id: '$status',
          cantidad: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Pagos vencidos
    const vencidos = await Payment.aggregate([
      {
        $match: {
          status: 'pending',
          dueDate: { $lt: today }
        }
      },
      {
        $group: {
          _id: null,
          cantidad: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Formatear respuesta
    const pagados = payments.find(p => p._id === 'paid') || { cantidad: 0, total: 0 };
    const pendientes = payments.find(p => p._id === 'pending') || { cantidad: 0, total: 0 };
    
    res.json({
      success: true,
      data: {
        pagados,
        pendientes,
        vencidos: vencidos[0] || { cantidad: 0, total: 0 }
      }
    });
  } catch (error) {
    console.error('Error al obtener estado de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado de pagos'
    });
  }
};

// 📅 EVENTOS PRÓXIMOS
export const getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const today = new Date();
    
    const events = await Event.find({
      date: { $gte: today }
    })
    .sort({ date: 1 })
    .limit(parseInt(limit))
    .select('title description date type');

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos'
    });
  }
};

// ⚠️ ALERTAS ACTIVAS
export const getActiveAlerts = async (req, res) => {
  try {
    const today = new Date();
    
    // Pagos pendientes vencidos
    const pagosPendientes = await Payment.find({
      status: 'pending',
      dueDate: { $lt: today }
    })
    .populate('student', 'firstName lastName')
    .sort({ dueDate: 1 })
    .limit(5);

    // Eventos próximos (próximos 7 días)
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    
    const eventosProximos = await Event.find({
      date: { $gte: today, $lte: weekFromNow }
    })
    .sort({ date: 1 })
    .limit(5);

    res.json({
      success: true,
      data: {
        pagosPendientes,
        eventosProximos,
        total: pagosPendientes.length + eventosProximos.length
      }
    });
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener alertas'
    });
  }
};

// 👥 ESTUDIANTES RECIENTES
export const getRecentStudents = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const students = await Student.find({ active: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('firstName lastName email phone martialArt beltLevel');

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estudiantes'
    });
  }
};

// 👤 DASHBOARD DEL ESTUDIANTE
export const getStudentDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el estudiante existe y el usuario tiene acceso
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    // Verificar autorización (solo admin o el propio estudiante)
    if (req.user.role !== 'admin' && req.user.id !== student.userId) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver estos datos'
      });
    }

    // Pagos del año actual
    const currentYear = new Date().getFullYear();
    const payments = await Payment.find({
      student: id,
      dueDate: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`)
      }
    }).sort({ dueDate: 1 });

    // Eventos próximos del estudiante
    const events = await Event.find({
      'participants.student': id,
      date: { $gte: new Date() }
    }).sort({ date: 1 }).limit(5);

    res.json({
      success: true,
      data: {
        perfil: {
          nombre: `${student.firstName} ${student.lastName}`,
          arte_marcial: student.martialArt,
          cinturon: student.beltLevel,
          proximoExamen: student.nextExam,
          federado: student.federated,
          numeroFederacion: student.federationNumber
        },
        pagos: payments.map(p => ({
          mes: p.dueDate.toLocaleString('es-ES', { month: 'long' }),
          monto: p.amount,
          estado: p.status,
          fechaVencimiento: p.dueDate
        })),
        eventos: events.map(e => ({
          fecha: e.date,
          titulo: e.title,
          descripcion: e.description
        })),
        progresion: student.beltHistory || []
      }
    });
  } catch (error) {
    console.error('Error al obtener dashboard del estudiante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener dashboard del estudiante'
    });
  }
};