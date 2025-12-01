import mongoose from 'mongoose';

const federationSchema = new mongoose.Schema(
  {
    // Nombre oficial de la federación
    name: {
      type: String,
      required: [true, 'El nombre de la federación es obligatorio'],
      trim: true,
      unique: true,
      maxlength: [100, 'El nombre es muy largo']
    },

    // Siglas o abreviatura
    acronym: {
      type: String,
      trim: true,
      maxlength: [20, 'Las siglas son muy largas']
    },

    // Tipo de federación
    type: {
      type: String,
      enum: ['nacional', 'regional', 'internacional', 'local'],
      default: 'nacional'
    },

    // País de la federación
    country: {
      type: String,
      trim: true,
      default: 'España'
    },

    // Sitio web oficial
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'La URL debe comenzar con http:// o https://']
    },

    // Contacto de la federación
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
    },

    // Teléfono de contacto
    contactPhone: {
      type: String,
      trim: true
    },

    // Disciplinas que cubre esta federación
    martialArts: [{
      type: String,
      enum: ['taekwondo', 'hapkido', 'muay-thai', 'karate', 'judo', 'general']
    }],

    // Año de fundación
    foundingYear: {
      type: Number,
      min: [1900, 'El año debe ser posterior a 1900'],
      max: [new Date().getFullYear(), 'El año no puede ser futuro']
    },

    // Si está activa o no
    active: {
      type: Boolean,
      default: true
    },

    // Notas adicionales
    notes: {
      type: String,
      maxlength: [500, 'Las notas son muy largas']
    }
  },
  {
    timestamps: true
  }
);

// Índices para búsquedas rápidas
federationSchema.index({ name: 1 });
federationSchema.index({ country: 1 });
federationSchema.index({ martialArts: 1 });

const Federation = mongoose.model('Federation', federationSchema);
export default Federation;