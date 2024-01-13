import mongoose, { model } from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    progress: {
        type: String,
        enum: ["resolved", "pending", "testing", "obeserving", "special"],
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    historyOfDiseases: [
        {
            type: String,
        },
        
    ]
}, {timestamps: true})

export const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema)