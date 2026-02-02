import Federation from '../models/federation.js';
import Student from '../models/Student.js';


const getFederations = async (req, res) => {
  try {
    const { martialArt, country } = req.query;
    
    let filter = {};
    
    if (martialArt) {
      filter.martialArts = martialArt;
    }
    
    if (country) {
      filter.country = country;
    }
    
    const federations = await Federation.find(filter)
      .sort({ name: 1 });
    
    res.json({
      count: federations.length,
      federations
    });
    
  } catch (error) {
    console.error('Error obteniendo federaciones:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};


const federateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { federationId, licenseNumber, licenseType, expiryDate } = req.body;
    
    
    const federation = await Federation.findById(federationId);
    if (!federation) {
      return res.status(404).json({ message: 'Federación no encontrada' });
    }
    
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    
    
    if (!federation.martialArts.includes(student.martialArt) && 
        !federation.martialArts.includes('general')) {
      return res.status(400).json({ 
        message: `Esta federación no cubre ${student.martialArt}` 
      });
    }
    
    
    if (student.federationInfo.licenseNumber) {
      student.federationInfo.licenseHistory.push({
        licenseNumber: student.federationInfo.licenseNumber,
        issueDate: student.federationInfo.federationDate || new Date(),
        expiryDate: student.federationInfo.licenseExpiryDate,
        type: student.federationInfo.licenseType,
        notes: 'Licencia anterior'
      });
    }
    
    
    student.federationInfo.federation = federationId;
    student.federationInfo.licenseNumber = licenseNumber;
    student.federationInfo.licenseType = licenseType || 'competition';
    student.federationInfo.licenseExpiryDate = new Date(expiryDate);
    student.federationInfo.isCurrentlyFederated = true;
    student.federationInfo.federationDate = new Date();
    
    await student.save();
    
    res.json({
      message: `${student.fullName} federado en ${federation.name}`,
      federation: federation.name,
      licenseNumber,
      expiryDate: new Date(expiryDate).toLocaleDateString()
    });
    
  } catch (error) {
    console.error('Error federando estudiante:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};


const getFederatedStudents = async (req, res) => {
  try {
    const { federationId } = req.params;
    
    const students = await Student.find({
      'federationInfo.federation': federationId,
      'federationInfo.isCurrentlyFederated': true
    })
    .populate('federationInfo.federation', 'name acronym')
    .select('fullName martialArt currentBelt federationInfo.licenseNumber federationInfo.licenseExpiryDate');
    
    const expiredLicenses = students.filter(s => 
      s.federationInfo.licenseExpiryDate < new Date()
    );
    
    const expiringSoon = students.filter(s => {
      const expiryDate = new Date(s.federationInfo.licenseExpiryDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate > new Date() && expiryDate <= thirtyDaysFromNow;
    });
    
    res.json({
      totalFederated: students.length,
      expiredLicenses: expiredLicenses.length,
      expiringSoon: expiringSoon.length,
      students,
      alerts: {
        expired: expiredLicenses.map(s => ({
          name: s.fullName,
          license: s.federationInfo.licenseNumber,
          expired: s.federationInfo.licenseExpiryDate
        })),
        expiring: expiringSoon.map(s => ({
          name: s.fullName,
          license: s.federationInfo.licenseNumber,
          expires: s.federationInfo.licenseExpiryDate
        }))
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo federados:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export { getFederations, federateStudent, getFederatedStudents };