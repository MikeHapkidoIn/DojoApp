import Student from '../models/Student.js';

// Promover estudiante a siguiente grado
const promoteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { newBelt, examDate, instructor, notes } = req.body;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    // Añadir al historial
    student.beltHistory.push({
      beltColor: student.currentBelt,
      dateAchieved: examDate || new Date(),
      instructor: instructor || 'Administrador',
      notes: notes || 'Promoción de grado'
    });

    // Actualizar cinturón actual
    student.currentBelt = newBelt;
    student.nextBeltExamDate = null; // Resetear próxima fecha

    await student.save();

    res.json({
      message: `¡${student.fullName} promovido a cinturón ${newBelt}!`,
      student
    });

  } catch (error) {
    console.error('Error promoviendo estudiante:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener historial de grados de un estudiante
const getBeltHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findById(studentId)
      .select('fullName currentBelt beltHistory');
    
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    res.json({
      student: student.fullName,
      currentBelt: student.currentBelt,
      history: student.beltHistory
    });

  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export { promoteStudent, getBeltHistory };