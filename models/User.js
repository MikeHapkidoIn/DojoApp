import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email:{
      type: String, 
      required: [true, 'El email es obligatorio'],
      unique: true, 
      lowercase: true, 
      trim: true,
    },
    password: {
      type: String, 
      required: [true, ' La contraseña es obligatoria'],
      minlenght: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    role: {
      type: String,
      enum: ['admin', 'student'], 
      default: 'student'
    },
    studentProfile:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null 
    }
  },
  
  {timestamps: true}

);

const User = mongoose.model ('User', userSchema);

export default User;









    

