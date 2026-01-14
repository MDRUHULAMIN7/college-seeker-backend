
import { model, Schema } from 'mongoose';
import type { ITutorial } from './tutorial.interface.js';

const tutorialSchema: Schema<ITutorial> = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },

  videoUrl:
   { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
},
  { timestamps: true } 
);
const Tutorial = model<ITutorial>("Tutorial ", tutorialSchema);
export default Tutorial ;