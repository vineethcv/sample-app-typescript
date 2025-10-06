import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: true })
export class ProjectMember {
  @Prop({ required: true }) projectId!: string;
  @Prop({ required: true }) userId!: string;
  @Prop({ required: true, enum: ['Owner','Member','Viewer'], default: 'Owner' }) role!: string;
}
export const ProjectMemberSchema = SchemaFactory.createForClass(ProjectMember);
(ProjectMemberSchema as any).index({ projectId: 1, userId: 1 }, { unique: true });