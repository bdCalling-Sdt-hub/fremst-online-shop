import mongoose from "mongoose";

const otherSchema = new mongoose.Schema({
   content: {
      type: String,
      required: true,
   }, 
   type: {
      type: String,
      enum: ['privacy-policy', 'terms-and-conditions', 'faq'],
      required: true,
   },
   
}, {
   timestamps: true,
});

export const Other = mongoose.model('Other', otherSchema)

const faqSchema = new mongoose.Schema({
   
   question: {
      type: String,
      required: true,
   },
   answer: {
      type: String,
      required: true,
   }
}, {
   timestamps: true,
});

export const Faq = mongoose.model('Faq', faqSchema)
