import Payment from '../models/Payment.js';
import Student from '../models/Student.js';
import mongoose from 'mongoose';


const createPayment = async (req, res) => {
  try {
    const { studentId, month, year, amount, dueDate, notes } = req.body;

    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        message: 'Estudiante no encontrado' 
      });
    }

    
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({ 
        message: 'Formato de mes inválido. Use YYYY-MM' 
      });
    }

   
    const existingPayment = await Payment.findOne({ 
      student: studentId, 
      month 
    });

    if (existingPayment) {
      return res.status(400).json({ 
        message: `Ya existe un pago para ${student.fullName} en ${month}` 
      });
    }

   
    const payment = await Payment.create({
      student: studentId,
      month,
      year: parseInt(year),
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      notes: notes || '',
      paid: false,
      paymentDate: null
    });

    res.status(201).json({
      message: '✅ Pago creado correctamente',
      payment: {
        _id: payment._id,
        student: student.fullName,
        month: payment.month,
        amount: payment.amount,
        dueDate: payment.dueDate,
        paid: payment.paid
      }
    });

  } catch (error) {
    console.error('❌ Error creando pago:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Error de validación',
        errors: messages 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Ya existe un pago para este estudiante en este mes' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error en el servidor al crear el pago' 
    });
  }
};


const getStudentPayments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { year, month, paid } = req.query;
    
    
    if (req.user.role === 'student') {
      // Buscar el estudiante asociado a este usuario
      const student = await Student.findOne({ user: req.user._id });
      if (!student || student._id.toString() !== studentId) {
        return res.status(403).json({ 
          message: 'No tienes permisos para ver estos pagos' 
        });
      }
    }

    const filter = { student: studentId };
    
    
    if (year) filter.year = parseInt(year);
    if (month) filter.month = month;
    if (paid !== undefined) filter.paid = paid === 'true';
    
    const payments = await Payment.find(filter)
      .populate('student', 'fullName')
      .sort({ month: -1 }) // Más recientes primero
      .select('-__v');

    // Calcular totales
    const totalPaid = payments
      .filter(p => p.paid)
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalPending = payments
      .filter(p => !p.paid)
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      message: '✅ Pagos obtenidos correctamente',
      count: payments.length,
      totals: {
        paid: totalPaid,
        pending: totalPending,
        total: totalPaid + totalPending
      },
      payments
    });

  } catch (error) {
    console.error('❌ Error obteniendo pagos:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        message: 'ID de estudiante no válido' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error en el servidor al obtener pagos' 
    });
  }
};


const markAsPaid = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentMethod, notes } = req.body;

    const payment = await Payment.findById(paymentId)
      .populate('student', 'fullName');

    if (!payment) {
      return res.status(404).json({ 
        message: 'Pago no encontrado' 
      });
    }

    if (payment.paid) {
      return res.status(400).json({ 
        message: 'Este pago ya estaba marcado como pagado' 
      });
    }

   
    payment.paid = true;
    payment.paymentDate = new Date();
    payment.paymentMethod = paymentMethod || 'efectivo';
    if (notes) payment.notes = notes;

    await payment.save();

    res.json({
      message: '✅ Pago marcado como realizado',
      payment: {
        _id: payment._id,
        student: payment.student.fullName,
        month: payment.month,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod
      }
    });

  } catch (error) {
    console.error('❌ Error marcando pago:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        message: 'ID de pago no válido' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error en el servidor al marcar pago' 
    });
  }
};


const getPaymentAlerts = async (req, res) => {
  try {
    const today = new Date();
    
    
    const overduePayments = await Payment.find({
      paid: false,
      dueDate: { $lt: today } 
    })
    .populate('student', 'fullName telefono email')
    .sort({ dueDate: 1 }) 
    .limit(20); 

    
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const upcomingPayments = await Payment.find({
      paid: false,
      dueDate: { 
        $gte: today, 
        $lte: nextWeek 
      }
    })
    .populate('student', 'fullName')
    .sort({ dueDate: 1 })
    .limit(10);

    
    const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);
    const totalUpcoming = upcomingPayments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      message: '✅ Alertas de pagos obtenidas',
      alerts: {
        overdue: {
          count: overduePayments.length,
          totalAmount: totalOverdue,
          payments: overduePayments.map(p => ({
            _id: p._id,
            student: p.student.fullName,
            month: p.month,
            amount: p.amount,
            dueDate: p.dueDate,
            daysOverdue: Math.floor((today - p.dueDate) / (1000 * 60 * 60 * 24))
          }))
        },
        upcoming: {
          count: upcomingPayments.length,
          totalAmount: totalUpcoming,
          payments: upcomingPayments.map(p => ({
            _id: p._id,
            student: p.student.fullName,
            month: p.month,
            amount: p.amount,
            dueDate: p.dueDate,
            daysUntilDue: Math.ceil((p.dueDate - today) / (1000 * 60 * 60 * 24))
          }))
        }
      },
      summary: {
        totalAlerts: overduePayments.length + upcomingPayments.length,
        totalAmount: totalOverdue + totalUpcoming,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo alertas:', error);
    res.status(500).json({ 
      message: 'Error en el servidor al obtener alertas' 
    });
  }
};


const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ 
        message: 'Se requieren año y mes (YYYY-MM)' 
      });
    }

    const monthString = `${year}-${month.padStart(2, '0')}`;
    
    const payments = await Payment.find({
      month: monthString
    })
    .populate('student', 'fullName arteMarcial categoria')
    .sort({ paid: 1, student: 1 }) 
    .select('-__v');

    // Calcular estadísticas
    const totalStudents = await Student.countDocuments({ activo: true });
    const paidPayments = payments.filter(p => p.paid);
    const pendingPayments = payments.filter(p => !p.paid);
    
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const paymentRate = totalStudents > 0 
      ? (paidPayments.length / totalStudents) * 100 
      : 0;

    res.json({
      message: `✅ Reporte de ${monthString}`,
      period: monthString,
      statistics: {
        totalStudents,
        totalPayments: payments.length,
        paid: paidPayments.length,
        pending: pendingPayments.length,
        paymentRate: paymentRate.toFixed(2) + '%',
        totalCollected: totalPaid,
        totalPending: totalPending,
        expectedTotal: totalPaid + totalPending
      },
      byMartialArt: calculateByMartialArt(payments),
      payments: {
        paid: paidPayments,
        pending: pendingPayments
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo reporte:', error);
    res.status(500).json({ 
      message: 'Error en el servidor al obtener reporte' 
    });
  }
};


const calculateByMartialArt = (payments) => {
  const byArt = {};
  
  payments.forEach(payment => {
    const art = payment.student.arteMarcial;
    if (!byArt[art]) {
      byArt[art] = {
        total: 0,
        paid: 0,
        pending: 0,
        amountPaid: 0,
        amountPending: 0
      };
    }
    
    byArt[art].total++;
    if (payment.paid) {
      byArt[art].paid++;
      byArt[art].amountPaid += payment.amount;
    } else {
      byArt[art].pending++;
      byArt[art].amountPending += payment.amount;
    }
  });
  
  return byArt;
};


const getMyPayments = async (req, res) => {
  try {
    
    const student = await Student.findOne({ user: req.user._id });
    
    if (!student) {
      return res.status(404).json({ 
        message: 'Perfil de estudiante no encontrado' 
      });
    }

    const { year } = req.query;
    const filter = { student: student._id };
    
    if (year) filter.year = parseInt(year);
    
    const payments = await Payment.find(filter)
      .sort({ month: -1 })
      .select('-__v');

    
    const currentYear = new Date().getFullYear();
    const currentYearPayments = payments.filter(p => p.year === currentYear);
    
    const paidThisYear = currentYearPayments.filter(p => p.paid);
    const pendingThisYear = currentYearPayments.filter(p => !p.paid);
    
    const totalPaid = paidThisYear.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = pendingThisYear.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      message: '✅ Tus pagos obtenidos correctamente',
      student: student.fullName,
      summary: {
        currentYear,
        totalPayments: currentYearPayments.length,
        paid: paidThisYear.length,
        pending: pendingThisYear.length,
        amountPaid: totalPaid,
        amountPending: totalPending
      },
      payments
    });

  } catch (error) {
    console.error('❌ Error obteniendo mis pagos:', error);
    res.status(500).json({ 
      message: 'Error en el servidor al obtener tus pagos' 
    });
  }
};


export {
  createPayment,
  getStudentPayments,
  markAsPaid,
  getPaymentAlerts,
  getMonthlyReport,
  getMyPayments
};