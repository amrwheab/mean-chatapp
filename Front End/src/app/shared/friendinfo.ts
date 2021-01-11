import { Message } from './message';

export class FriendInfo {
  id: string;
  friendId: string;
  imgUrl: string;
  name: string;
  lastMSG: Message;
  notSeenMsg: number;
  online: boolean;
}
