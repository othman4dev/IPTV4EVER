export interface IAttachment {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface IReadReceipt {
  readerId: string;
  readAt: Date;
}

export interface IMessage {
  id: string;
  senderId: string;
  content: string | null;
  attachments: IAttachment[];
  readReceipts?: IReadReceipt[];
  createdAt: Date;
}

export interface IConversation {
  id: string;
  clientId: string;
  adminId: string;
  showReadReceiptsToClient: boolean;
  createdAt: Date;
  updatedAt: Date;
}
