export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  image?: string; // URL for user-uploaded or bot-generated image
}

export interface ImagePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}
