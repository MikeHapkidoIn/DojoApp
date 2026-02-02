import Event from '../models/Event.js';
import Student from '../models/Student.js';


const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      type,
      martialArt,
      location,
      duration,
      participantLimit,
      cost,
      visibleToStudents = true
    } = req.body;

    
    const eventDate = new Date(date);
    const now = new Date();
    
    if (eventDate < now) {
      return res.status(400).json({
        message: 'No se pueden crear eventos en el pasado'
      });
    }

   
    const event = await Event.create({
      title,
      description: description || '',
      date: eventDate,
      type,
      martialArt,
      location: location || '',
      duration: duration || 60,
      participantLimit: participantLimit || 0,
      cost: cost || 0,
      visibleToStudents,
      createdBy: req.user._id 
    });

    res.status(201).json({
      message: '✅ Evento creado correctamente',
      event: {
        _id: event._id,
        title: event.title,
        date: event.date,
        type: event.type,
        martialArt: event.martialArt,
        location: event.location
      }
    });

  } catch (error) {
    console.error('❌ Error creando evento:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Error de validación',
        errors: messages
      });
    }
    
    res.status(500).json({
      message: 'Error en el servidor al crear el evento'
    });
  }
};


const getEvents = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type,
      martialArt,
      page = 1,
      limit = 20
    } = req.query;
    
    const filter = {};
    
    
    if (req.user.role === 'student') {
      filter.visibleToStudents = true;
    }
    
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
   
    if (type) filter.type = type;
    
    
    if (martialArt && martialArt !== 'all') {
      filter.martialArt = { $in: [martialArt, 'all'] };
    }
    
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const events = await Event.find(filter)
      .populate('createdBy', 'email')
      .sort({ date: 1 }) // Orden cronológico
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    const totalEvents = await Event.countDocuments(filter);
    
    res.json({
      message: '✅ Eventos obtenidos correctamente',
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalEvents,
        pages: Math.ceil(totalEvents / parseInt(limit))
      },
      filters: {
        startDate,
        endDate,
        type,
        martialArt
      },
      events
    });

  } catch (error) {
    console.error('❌ Error obteniendo eventos:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener eventos'
    });
  }
};


const getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 10, martialArt } = req.query;
    const now = new Date();
    
    const filter = {
      date: { $gte: now }
    };
    
    
    if (req.user.role === 'student') {
      filter.visibleToStudents = true;
    }
    
    
    if (martialArt && martialArt !== 'all') {
      filter.martialArt = { $in: [martialArt, 'all'] };
    } else if (req.user.role === 'student') {
      // Si no se especifica, usar el arte marcial del estudiante
      const student = await Student.findOne({ user: req.user._id });
      if (student && student.arteMarcial) {
        filter.martialArt = { $in: [student.arteMarcial, 'all'] };
      }
    }
    
    const events = await Event.find(filter)
      .populate('createdBy', 'email')
      .sort({ date: 1 }) // Próximos primero
      .limit(parseInt(limit))
      .select('-__v');
    
    
    const eventsByMonth = {};
    events.forEach(event => {
      const monthYear = event.date.toLocaleString('es-ES', {
        month: 'long',
        year: 'numeric'
      });
      
      if (!eventsByMonth[monthYear]) {
        eventsByMonth[monthYear] = [];
      }
      
      eventsByMonth[monthYear].push({
        _id: event._id,
        title: event.title,
        date: event.date,
        type: event.type,
        martialArt: event.martialArt,
        location: event.location
      });
    });
    
    res.json({
      message: '✅ Eventos próximos obtenidos',
      count: events.length,
      eventsByMonth,
      events
    });

  } catch (error) {
    console.error('❌ Error obteniendo eventos próximos:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener eventos próximos'
    });
  }
};


const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'email')
      .select('-__v');
    
    if (!event) {
      return res.status(404).json({
        message: 'Evento no encontrado'
      });
    }
    
    
    if (req.user.role === 'student' && !event.visibleToStudents) {
      return res.status(403).json({
        message: 'No tienes permisos para ver este evento'
      });
    }
    
    res.json({
      message: '✅ Evento obtenido correctamente',
      event
    });

  } catch (error) {
    console.error('❌ Error obteniendo evento:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        message: 'ID de evento no válido'
      });
    }
    
    res.status(500).json({
      message: 'Error en el servidor al obtener el evento'
    });
  }
};


const updateEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      type,
      martialArt,
      location,
      duration,
      participantLimit,
      cost,
      visibleToStudents
    } = req.body;
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        message: 'Evento no encontrado'
      });
    }
    
    
    if (event.createdBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'No tienes permisos para actualizar este evento'
      });
    }
    
   
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = new Date(date);
    if (type !== undefined) updates.type = type;
    if (martialArt !== undefined) updates.martialArt = martialArt;
    if (location !== undefined) updates.location = location;
    if (duration !== undefined) updates.duration = duration;
    if (participantLimit !== undefined) updates.participantLimit = participantLimit;
    if (cost !== undefined) updates.cost = cost;
    if (visibleToStudents !== undefined) updates.visibleToStudents = visibleToStudents;
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'email')
    .select('-__v');
    
    res.json({
      message: '✅ Evento actualizado correctamente',
      event: updatedEvent
    });

  } catch (error) {
    console.error('❌ Error actualizando evento:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Error de validación',
        errors: messages
      });
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        message: 'ID de evento no válido'
      });
    }
    
    res.status(500).json({
      message: 'Error en el servidor al actualizar el evento'
    });
  }
};


const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        message: 'Evento no encontrado'
      });
    }
    
    
    if (event.createdBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'No tienes permisos para eliminar este evento'
      });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    
    res.json({
      message: '✅ Evento eliminado correctamente',
      deletedEvent: {
        _id: event._id,
        title: event.title,
        date: event.date
      }
    });

  } catch (error) {
    console.error('❌ Error eliminando evento:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        message: 'ID de evento no válido'
      });
    }
    
    res.status(500).json({
      message: 'Error en el servidor al eliminar el evento'
    });
  }
};


const getTodayEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const filter = {
      date: {
        $gte: today,
        $lt: tomorrow
      }
    };
    
  
    if (req.user.role === 'student') {
      filter.visibleToStudents = true;
    }
    
    const events = await Event.find(filter)
      .populate('createdBy', 'email')
      .sort({ date: 1 })
      .select('-__v');
    
    
    const eventsByMartialArt = {};
    events.forEach(event => {
      if (!eventsByMartialArt[event.martialArt]) {
        eventsByMartialArt[event.martialArt] = [];
      }
      eventsByMartialArt[event.martialArt].push(event);
    });
    
    res.json({
      message: '✅ Eventos de hoy obtenidos',
      date: today.toISOString().split('T')[0],
      count: events.length,
      eventsByMartialArt,
      events
    });

  } catch (error) {
    console.error('❌ Error obteniendo eventos de hoy:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener eventos de hoy'
    });
  }
};


export {
  createEvent,
  getEvents,
  getUpcomingEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getTodayEvents
};