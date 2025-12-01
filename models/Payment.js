import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
   
    student: {
      type: mongoose.Schema.Types.ObjectId,  // Tipo ObjectId de MongoDB
      ref: 'Student',  // Esto crea una relación con el modelo Student
      required: [true, 'El estudiante es obligatorio']  // Es obligatorio y muestra este mensaje si falta
    },

    
    month: {
      type: String,
      required: [true, 'El mes es obligatorio'],
      // match valida que el string tenga formato YYYY-MM usando una expresión regular
      match: [/^\d{4}-\d{2}$/, 'Formato de mes inválido (YYYY-MM)']
    },

    
    year: {
      type: Number,
      required: [true, 'El año es obligatorio']
    },

    
    amount: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: [0, 'El monto no puede ser negativo']  // Validación: número mínimo 0
    },

    
    paid: {
      type: Boolean,
      default: false  // Valor por defecto: false (no pagado)
    },

    
    paymentDate: {
      type: Date,
      default: null  // Null hasta que se pague
    },

    
    dueDate: {
      type: Date,
      required: [true, 'La fecha límite es obligatoria']
    },

    
    paymentMethod: {
      type: String,
      enum: ['efectivo', 'tarjeta'],  
      default: 'tarjeta'  
    },

    
    notes: {
      type: String,
      maxlength: [500, 'Las notas no pueden tener más de 500 caracteres']
    }
  },
  {
    
    timestamps: true  
                                     
  }
);


paymentSchema.index({ student: 1, month: 1 }, { unique: true });


paymentSchema.index({ paid: 1 });


paymentSchema.index({ dueDate: 1 });


const Payment = mongoose.model('Payment', paymentSchema);


export default Payment;