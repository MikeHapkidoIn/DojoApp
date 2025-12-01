import mongoose from 'mongoose';

// Esquema para el calendario de eventos
const eventSchema = new mongoose.Schema(
  {
    // CAMPO: Título del evento
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,  // Elimina espacios en blanco al inicio y final
      maxlength: [100, 'El título no puede tener más de 100 caracteres']
    },

    // CAMPO: Descripción detallada
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'La descripción no puede tener más de 1000 caracteres']
    },

    // CAMPO: Fecha y hora del evento
    date: {
      type: Date,  // Almacena fecha Y hora
      required: [true, 'La fecha es obligatoria']
    },

    // CAMPO: Tipo de evento
    type: {
      type: String,
      required: [true, 'El tipo de evento es obligatorio'],
      enum: ['competición', 'examen', 'entrenamiento', 'general'],  // Valores permitidos
      default: 'general'  // Valor por defecto
    },

    // CAMPO: Disciplina marcial
    martialArt: {
      type: String,
      required: [true, 'La disciplina marcial es obligatoria'],
      enum: ['all', 'taekwondo', 'hapkido', 'muay-thai'],  // 'all' = evento para todos
      default: 'all'
    },

    // CAMPO: Quién creó el evento (solo administradores)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Relación con modelo User
      required: [true, 'El creador del evento es obligatorio']
    },

    // CAMPO: Ubicación del evento
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'La ubicación no puede tener más de 200 caracteres']
    },

    // CAMPO: Duración en minutos
    duration: {
      type: Number,
      min: [0, 'La duración no puede ser negativa'],  // Validación mínima
      default: 60  // 1 hora por defecto
    },

    // CAMPO: Visibilidad para estudiantes
    visibleToStudents: {
      type: Boolean,
      default: true  // Por defecto visible
    },

    // CAMPO: Límite de participantes
    participantLimit: {
      type: Number,
      min: [0, 'El límite no puede ser negativo'],
      default: 0  // 0 = sin límite
    },

    // CAMPO: Costo del evento
    cost: {
      type: Number,
      min: [0, 'El costo no puede ser negativo'],
      default: 0  // 0 = gratuito
    }
  },
  {
    // OPCIONES DEL ESQUEMA
    timestamps: true  // Crea createdAt y updatedAt automáticamente
  }
);

// 🚀 ÍNDICES PARA OPTIMIZAR BÚSQUEDAS

// Índice por fecha: acelera búsquedas como "eventos de este mes"
eventSchema.index({ date: 1 });  // 1 = orden ascendente

// Índice por tipo: acelera filtros por tipo de evento
eventSchema.index({ type: 1 });

// Índice por disciplina: acelera filtros por arte marcial
eventSchema.index({ martialArt: 1 });

// Creamos el modelo
const Event = mongoose.model('Event', eventSchema);

// Exportamos el modelo
export default Event;