import mongoose from 'mongoose';

const federationSchema = new mongoose.Schema(
  {
    
    name: {
      type: String,
      required: [true, 'El nombre de la federación es obligatorio'],
      trim: true,
      unique: true,
      maxlength: [100, 'El nombre es muy largo']
    },

    
    acronym: {
      type: String,
      trim: true,
      maxlength: [20, 'Las siglas son muy largas']
    },

    
    type: {
      type: String,
      enum: ['nacional', 'regional', 'internacional', 'local'],
      default: 'nacional'
    },

   
    country: {
      type: String,
      trim: true,
      default: 'España'
    },

    
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'La URL debe comenzar con http:// o https://']
    },

    
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
    },

    
    contactPhone: {
      type: String,
      trim: true
    },

    
    martialArts: [{
      type: String,
      enum: ['taekwondo', 'hapkido', 'muay-thai', 'karate', 'judo', 'general']
    }],

    
    foundingYear: {
      type: Number,
      min: [1900, 'El año debe ser posterior a 1900'],
      max: [new Date().getFullYear(), 'El año no puede ser futuro']
    },

    
    active: {
      type: Boolean,
      default: true
    },

    
    notes: {
      type: String,
      maxlength: [500, 'Las notas son muy largas']
    }
  },
  {
    timestamps: true
  }
);


federationSchema.index({ name: 1 });
federationSchema.index({ country: 1 });
federationSchema.index({ martialArts: 1 });

const Federation = mongoose.model('Federation', federationSchema);
export default Federation;