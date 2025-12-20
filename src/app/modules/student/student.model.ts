import validator from 'validator';
import { Schema, model } from 'mongoose';
import {
  type Guardian,
  type LocalGuardian,
  type Student,
  type UserName,
} from './student.interface.js';

const userNameSchema = new Schema<UserName>({
  firstName: {
    type: String,
    required: [true, 'First Name is Required'],
    trim: true,
    maxlength: [20, 'First Name cannot be more than 20 characters'],
    validate: {
      validator: function (value: string) {
        const firstNameStr = value.charAt(0).toUpperCase() + value.slice(1);
        return firstNameStr === value;
      },
      message: '{VALUE} is not in capitalize formate',
    },
  },
  middleName: {
    type: String,
    trim: true,
    maxlength: [20, 'Middle Name cannot be more than 20 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last Name is Required'],
    validate: {
      validator: (value: string) => validator.isAlpha(value),
      message: '{VALUE} is not valid',
    },
  },
});

const guardianSchema = new Schema<Guardian>({
  fatherName: {
    type: String,
    required: [true, 'Father Name is Required'],
    trim: true,
    maxlength: [20, ' Name cannot be more than 20 characters'],
  },
  fatherOccupation: {
    type: String,
    required: [true, 'Father Occupation is Required'],
  },
  fatherContactNo: {
    type: String,
    required: [true, 'Father Contact Number is Required'],
  },
  motherName: {
    type: String,
    required: [true, 'Mother Name is Required'],
    trim: true,
    maxlength: [20, ' Name cannot be more than 20 characters'],
  },
  motherOccupation: {
    type: String,
    required: [true, 'Mother Occupation is Required'],
  },
  motherContactNo: {
    type: String,
    required: [true, 'Mother Contact Number is Required'],
  },
});

const localGuardianSchema = new Schema<LocalGuardian>({
  name: {
    type: String,
    required: [true, 'Local Guardian Name is Required'],
    trim: true,
    maxlength: [20, ' Name cannot be more than 20 characters'],
  },
  occupation: {
    type: String,
    required: [true, 'Local Guardian Occupation is Required'],
  },
  contactNo: {
    type: String,
    required: [true, 'Local Guardian Contact Number is Required'],
  },
  address: {
    type: String,
    required: [true, 'Local Guardian Address is Required'],
  },
});

const studentSchema = new Schema<Student>({
  id: {
    type: String,
    required: [true, 'Student ID is Required'],
    unique: true,
  },
  name: {
    type: userNameSchema,
    required: [true, 'Student Name is Required'],
  },
  gender: {
    type: String,
    enum: {
      values: ['male', 'female', 'others'],
      message:
        "gender {VALUE} is not valid and should be one of 'male', 'female', 'others'",
    },
    required: [true, 'Gender is Required'],
  },
  dateOfBirth: {
    type: String,
  },
  email: {
    type: String,
    required: [true, 'Email is Required'],
    unique:true,
    validate:{
      validator:(value:string)=>validator.isEmail(value),
      message:"{VALUE} is not valid"
    }
  },
  contactNo: {
    type: String,
    required: [true, 'Contact Number is Required'],
  },
  emergencyContactNo: {
    type: String,
    required: [true, 'Emergency Contact Number is Required'],
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  presentAddress: {
    type: String,
    required: [true, 'Present Address is Required'],
  },
  permanentAddress: {
    type: String,
    required: [true, 'Permanent Address is Required'],
  },
  guardian: {
    type: guardianSchema,
    required: [true, 'Guardian Information is Required'],
  },
  localGuardian: {
    type: localGuardianSchema,
    required: [true, 'Local Guardian Information is Required'],
  },
  profileImg: {
    type: String,
  },
  isActive: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active',
  },
});

export const StudentModel = model<Student>('Student', studentSchema);
