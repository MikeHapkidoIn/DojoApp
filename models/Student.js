import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // ======================
    // 📋 INFORMACIÓN BÁSICA (EXISTENTE)
    // ======================
    
    // Relación con el usuario
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio']
    },
    
    // Datos personales
    fullName: {
      type: String,
      required: [true, 'El nombre completo es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede tener más de 100 caracteres'] // 🛠️ CORREGIDO: maxlenght → maxlength
    },
    
    direccion: {
      type: String,
      required: [true, 'La dirección es obligatoria'],
      trim: true
    },
    
    fechaNacimiento: {
      type: Date,
      required: [true, 'La fecha de nacimiento es obligatoria']
    },

    // ======================
    // 🥋 ARTES MARCIALES (EXISTENTE)
    // ======================
    
    arteMarcial: {
      type: String,
      required: [true, 'La disciplina marcial es obligatoria'],
      enum: ['taekwondo', 'hapkido', 'muay-thai'],
      lowercase: true
    },
    
    categoria: {
      type: String,
      required: [true, 'La categoria es obligatoria'],
      enum: ['infantil', 'juvenil', 'cadete', 'adulto'],
      lowercase: true
    },

    // ======================
    // 🥋 NUEVO: SISTEMA DE GRADOS (CINTURONES)
    // ======================
    
    cinturonActual: {
      type: String,
      enum: [
        'blanco', 'amarillo', 'naranja', 'verde', 
        'azul', 'violeta', 'marron', 'rojo',
        'negro-1dan', 'negro-2dan', 'negro-3dan',
        'negro-4dan', 'negro-5dan', 'negro-6dan'
      ],
      default: 'blanco'
    },
    
    fechaProximoExamen: {
      type: Date,
      default: null
    },
    
    historialCinturones: [{
      cinturon: {
        type: String,
        required: true
      },
      fechaObtencion: {
        type: Date,
        required: true
      },
      instructor: {
        type: String,
        trim: true
      },
      notas: {
        type: String,
        maxlength: [200, 'Las notas no pueden tener más de 200 caracteres']
      }
    }],

    // ======================
    // 🏛️ NUEVO: SISTEMA DE FEDERACIÓN
    // ======================
    
    informacionFederacion: {
      // Nombre de la federación
      nombreFederacion: {
        type: String,
        trim: true,
        maxlength: [100, 'El nombre de la federación es muy largo']
      },
      
      // Número de licencia federativa
      numeroLicencia: {
        type: String,
        trim: true,
        unique: true,
        sparse: true  // Permite null pero mantiene unicidad para los que tienen licencia
      },
      
      // Fecha de vencimiento de la licencia
      fechaVencimientoLicencia: {
        type: Date,
        default: null
      },
      
      // Tipo de licencia
      tipoLicencia: {
        type: String,
        enum: ['competencia', 'instructor', 'arbitro', 'general'],
        default: 'competencia'
      },
      
      // Estado actual de federación
      federadoActual: {
        type: Boolean,
        default: false
      },
      
      // Fecha de federación
      fechaFederacion: {
        type: Date,
        default: null
      },
      
      // Historial de federaciones (si cambia de federación)
      historialFederaciones: [{
        federacion: String,
        numeroLicencia: String,
        fechaInicio: Date,
        fechaFin: Date,
        tipo: String,
        notas: String
      }]
    },

    // ======================
    // 📞 CONTACTO (EXISTENTE)
    // ======================
    
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true
    },

    contactoEmergencia: {
      type: String,
      required: [true, 'El contacto de emergencia es obligatorio'],
      trim: true
    },

    // ======================
    // 🏆 NUEVO: LOGROS Y CERTIFICACIONES
    // ======================
    
    logros: [{
      titulo: {
        type: String,
        required: true
      },
      descripcion: String,
      fecha: Date,
      organizador: String,
      ubicacion: String,
      notas: String
    }],

    // ======================
    // 📸 FOTO Y ESTADO (EXISTENTE)
    // ======================
    
    foto: {
      type: String,
      default: ''
    },

    fechaRegistro: {
      type: Date,
      default: Date.now
    },

    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    // Opciones del esquema
    timestamps: true  // Crea createdAt y updatedAt automáticamente
  }
);


// 🚀 ÍNDICES PARA OPTIMIZAR BÚSQUEDAS


// Índice único: un Student por User
studentSchema.index({ user: 1 }, { unique: true });

// Índice para búsquedas por cinturón
studentSchema.index({ cinturonActual: 1 });

// Índice para búsquedas por federación
studentSchema.index({ 'informacionFederacion.federadoActual': 1 });

// Índice para alertas de vencimiento de licencia
studentSchema.index({ 'informacionFederacion.fechaVencimientoLicencia': 1 });

// Índice para próximos exámenes
studentSchema.index({ fechaProximoExamen: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;
