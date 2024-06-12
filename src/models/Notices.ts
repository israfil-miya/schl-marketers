import mongoose from 'mongoose';

// Interface for Notice document
interface Notice {
  updated_by: string | null;
  channel: string;
  notice_no: string;
  title: string;
  description: string;
  file_name?: string;
}

// Create Notice schema with type annotations for properties
const NoticeSchema = new mongoose.Schema<Notice>(
  {
    updated_by: { type: String, default: null },
    channel: { type: String, required: [true, 'Channel is not given'] },
    notice_no: {
      type: String,
      required: [true, 'Notice no. is not given'],
      unique: true,
      index: true,
    },
    title: { type: String, required: [true, 'Title is not given'] },
    description: { type: String, required: [true, 'Description is not given'] },
    file_name: { type: String, default: '' },
  },
  {
    timestamps: true, // Add timestamps for created and updated at fields
  },
);

// Define Notice model based on schema, using generics for type safety
const Notice =
  mongoose.models.Notice || mongoose.model<Notice>('Notice', NoticeSchema);

// Export the Notice model
export default Notice;
