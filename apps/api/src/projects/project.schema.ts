import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, trim: true }) name!: string;
}
export const ProjectSchema = SchemaFactory.createForClass(Project);