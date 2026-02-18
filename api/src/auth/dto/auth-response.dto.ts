export interface AuthResponseDto {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponseDto;
}

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
