import mongoose from 'mongoose';

const beltSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: [true, 'El color del cinturón es obligatorio'],
      unique: true,
      trim: true
    },
    
    order: {
      type: Number,
      required: [true, 'El orden es obligatorio'],
      unique: true
    },
    
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción es muy larga']
    },
    
    minimumTime: {
      type: Number, // Días mínimos en el grado anterior
      default: 0
    },
    
    typicalAgeRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 }
    },
    
    isBlackBelt: {
      type: Boolean,
      default: false
    },
    
    danLevel: {
      type: Number,
      default: 0 
    }
  },
  {
    timestamps: true
  }
);

const Belt = mongoose.model('Belt', beltSchema);
export default Belt;