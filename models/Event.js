import mongoose from 'mongoose';


const eventSchema = new mongoose.Schema(
  {
    
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,  // Elimina espacios en blanco al inicio y final
      maxlength: [100, 'El título no puede tener más de 100 caracteres']
    },

    
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'La descripción no puede tener más de 1000 caracteres']
    },

    
    date: {
      type: Date,  // Almacena fecha Y hora
      required: [true, 'La fecha es obligatoria']
    },

    
    type: {
      type: String,
      required: [true, 'El tipo de evento es obligatorio'],
      enum: ['competición', 'examen', 'entrenamiento', 'general'], 
      default: 'general'  // Valor por defecto
    },

    
    martialArt: {
      type: String,
      required: [true, 'La disciplina marcial es obligatoria']
      enum: ['all', 'taekwondo', 'hapkido', 'muay-thai'], 
      default: 'all'
    },

    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Relación con modelo User
      required: [true, 'El creador del evento es obligatorio']
    },

    
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'La ubicación no puede tener más de 200 caracteres']
    },

    
    duration: {
      type: Number,
      min: [0, 'La duración no puede ser negativa'],  // Validación mínima
      default: 60  // 1 hora por defecto
    },

    
    visibleToStudents: {
      type: Boolean,
      default: true  // Por defecto visible
    },

    
    participantLimit: {
      type: Number,
      min: [0, 'El límite no puede ser negativo'],
      default: 0  // 0 = sin límite
    },

    
    cost: {
      type: Number,
      min: [0, 'El costo no puede ser negativo'],
      default: 0  // 0 = gratuito
    }
  },
  {
    
    timestamps: true  
  }
);

//ÍNDICES PARA OPTIMIZAR BÚSQUEDAS


eventSchema.index({ date: 1 });  


eventSchema.index({ type: 1 });


eventSchema.index({ martialArt: 1 });


const Event = mongoose.model('Event', eventSchema);


export default Event;