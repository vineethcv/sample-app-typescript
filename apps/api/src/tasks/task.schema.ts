import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class Task {
  @Prop({ required: true }) projectId!: string;
  @Prop({ required: true, trim: true }) title!: string;
  @Prop() description?: string;
  @Prop({ enum: ['Todo','InProgress','Done'], default: 'Todo' }) status!: string;
  @Prop({ enum: ['Low','Medium','High'], default: 'Medium' }) priority!: string;
  @Prop() dueDate?: Date;
  @Prop() assigneeId?: string;
  @Prop({ type: [String], default: [] }) labelIds!: string[];
  @Prop({ type: Number, default: 1048576 }) orderIndex!: number;
  @Prop({ type: Number, default: 1 }) version!: number;
  @Prop() createdAt!: Date;
  @Prop() updatedAt!: Date;
}
export const TaskSchema = SchemaFactory.createForClass(Task);
(TaskSchema as any).index({ projectId: 1, createdAt: -1, _id: -1 });
(TaskSchema as any).index({ projectId: 1, status: 1, createdAt: -1, _id: -1 });
(TaskSchema as any).index({ projectId: 1, labelIds: 1, createdAt: -1, _id: -1 });
(TaskSchema as any).index({ projectId: 1, assigneeId: 1, createdAt: -1, _id: -1 });
(TaskSchema as any).index({ projectId: 1, title: 'text', description: 'text' });

@Schema()
export class Label {
  @Prop({ required: true }) projectId!: string;
  @Prop({ required: true }) name!: string;
  @Prop({ required: true, default: '#7c3aed' }) color!: string;
}
export const LabelSchema = SchemaFactory.createForClass(Label);
(LabelSchema as any).index({ projectId: 1, name: 1 }, { unique: true });